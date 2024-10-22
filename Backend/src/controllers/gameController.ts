// src/controllers/gameController.ts

import {Request, Response} from 'express';
import Game, {IGame, IAnswer} from '../models/Game';
import Player, {IPlayer} from '../models/Player';
import Question, {
    IMultipleChoiceQuestion,
    IRankingQuestion,
    IWhatWouldYouRatherQuestion,
    IWhoWouldRatherQuestion
} from '../models/Question';
import { IQuestion } from '../types'; // Correct import
import {Server as SocketIOServer} from 'socket.io';
import {nanoid} from 'nanoid';
import {Types} from 'mongoose';
import {shuffleArray} from '../utils/questionUtils'; // Utility function to shuffle questions

/**
 * Initialize the Socket.IO server instance.
 */
let io: SocketIOServer;

/**
 * Function to set the Socket.IO instance.
 * Call this from your main server file after initializing Socket.IO.
 */
export const setSocketIO = (socketIO: SocketIOServer) => {
    io = socketIO;
};

/**
 * Controller to create a new game.
 * Expects `creatorUuid` and `settings` in the request body.
 */
export const createGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const {creatorUuid, settings} = req.body;

        // Validate required fields
        if (!creatorUuid || !settings) {
            res.status(400).json({message: 'creatorUuid and settings are required.'});
            return;
        }

        // Validate settings structure
        const {numberOfQuestions, questionTypes, timeLimit, punishmentMultiplier} = settings;
        if (
            typeof numberOfQuestions !== 'number' ||
            !Array.isArray(questionTypes) ||
            typeof timeLimit !== 'number' ||
            typeof punishmentMultiplier !== 'number'
        ) {
            res.status(400).json({message: 'Invalid settings format.'});
            return;
        }

        // Generate a unique game code using nanoid
        const gameCode = nanoid(6).toUpperCase(); // Example: "ABC123"

        // Create a new game
        const newGame: IGame = new Game({
            code: gameCode,
            creatorUuid,
            settings: {
                numberOfQuestions,
                questionTypes,
                timeLimit,
                punishmentMultiplier,
            },
            players: [creatorUuid], // Add creator to the players array
            questions: [], // Will be populated when the game starts
            answers: [],
            isActive: false, // Game starts as inactive
            currentQuestionIndex: 0,
        });

        await newGame.save();

        // Add the gameCode to the creator's Player document
        const creator: IPlayer | null = await Player.findOne({uuid: creatorUuid});
        if (creator) {
            creator.gameCode = gameCode;
            await creator.save();
        } else {
            res.status(404).json({message: 'Creator user not found.'});
            return;
        }

        res.status(201).json({
            message: 'Game created successfully.',
            game: {
                code: newGame.code,
                settings: newGame.settings,
                players: newGame.players,
                createdAt: newGame.createdAt,
            },
        });

        // Emit event to notify creation (optional)
        io.emit('gameCreated', {gameCode: newGame.code, creatorUuid});
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to join a game.
 * Expects `userUuid` in the request body.
 */
export const joinGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;
        const {userUuid} = req.body;

        // Validate input
        if (!userUuid) {
            res.status(400).json({message: 'userUuid is required to join a game.'});
            return;
        }

        // Find the game by code
        const game: IGame | null = await Game.findOne({code});
        if (!game) {
            res.status(404).json({message: 'Game not found.'});
            return;
        }

        // Check if the user is already in the game
        if (game.players.includes(userUuid)) {
            res.status(400).json({message: 'User is already in the game.'});
            return;
        }

        // Find the user (Player) by UUID
        const user: IPlayer | null = await Player.findOne({uuid: userUuid});
        if (!user) {
            res.status(404).json({message: 'User not found.'});
            return;
        }

        // Update the user's gameCode
        user.gameCode = code;
        await user.save();

        // Add the user's UUID to the game's players array
        game.players.push(userUuid);
        await game.save();

        res.status(200).json({
            message: 'User joined the game successfully.',
            game: {
                code: game.code,
                players: game.players,
            },
        });

        // Emit event to notify game participants
        io.to(game.code).emit('playerJoined', {userUuid, gameCode: game.code});
    } catch (error) {
        console.error('Error joining game:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to leave a game.
 * Expects `userUuid` in the request body.
 */
export const leaveGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;
        const {userUuid} = req.body;

        // Validate input
        if (!userUuid) {
            res.status(400).json({message: 'userUuid is required to leave a game.'});
            return;
        }

        // Find the game by code
        const game: IGame | null = await Game.findOne({code});
        if (!game) {
            res.status(404).json({message: 'Game not found.'});
            return;
        }

        // Check if the user is part of the game
        if (!game.players.includes(userUuid)) {
            res.status(400).json({message: 'User is not part of this game.'});
            return;
        }

        // Remove the user's UUID from the game's players array
        game.players = game.players.filter((uuid) => uuid !== userUuid);
        await game.save();

        // Update the user's gameCode to undefined
        const user: IPlayer | null = await Player.findOne({uuid: userUuid});
        if (user) {
            user.gameCode = undefined;
            await user.save();
        } else {
            res.status(404).json({message: 'User not found.'});
            return;
        }

        res.status(200).json({message: 'User left the game successfully.'});

        // Emit event to notify game participants
        io.to(game.code).emit('playerLeft', {userUuid, gameCode: game.code});
    } catch (error) {
        console.error('Error leaving game:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to start the game.
 * Populates questions based on game settings and marks the game as active.
 * Expects `code` in URL params.
 */
export const startGame = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;

        // Find the game by code
        const game: IGame | null = await Game.findOne({code});
        if (!game) {
            res.status(404).json({message: 'Game not found.'});
            return;
        }

        // Check if the game is already active
        if (game.isActive) {
            res.status(400).json({message: 'Game is already active.'});
            return;
        }

        // Fetch questions based on game settings
        const {numberOfQuestions, questionTypes} = game.settings;

        // Shuffle and select random questions
        const availableQuestions: IQuestion[] = await Question.find({
            type: {$in: questionTypes},
        });

        if (availableQuestions.length < numberOfQuestions) {
            res.status(400).json({message: 'Not enough questions available to start the game.'});
            return;
        }

        const selectedQuestions = shuffleArray(availableQuestions).slice(0, numberOfQuestions);

        // Assign questions to the game
        game.questions = selectedQuestions.map((q) => q._id);
        game.isActive = true;
        game.currentQuestionIndex = 0;
        await game.save();

        // Notify players that the game has started
        io.to(game.code).emit('gameStarted', {message: 'Game has started!'});

        // Send the first question
        const firstQuestion = selectedQuestions[0];
        io.to(game.code).emit('newQuestion', formatQuestionForClient(firstQuestion));

        res.status(200).json({message: 'Game started successfully.'});

        // Optionally, set a timer to advance to the next question after timeLimit
        setTimeout(() => {
            advanceToNextQuestion(game.code);
        }, game.settings.timeLimit * 1000);
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Helper function to format a question for client consumption.
 */
const formatQuestionForClient = (question: IQuestion) => {
    switch (question.type) {
        case 'multiple-choice':
            const mcQuestion = question as IMultipleChoiceQuestion;
            return {
                questionId: mcQuestion._id,
                type: mcQuestion.type,
                question: mcQuestion.question,
                category: mcQuestion.category,
                options: mcQuestion.options,
            };
        case 'who-would-rather':
        case 'what-would-you-rather':
            const wrQuestion = question as IWhoWouldRatherQuestion | IWhatWouldYouRatherQuestion;
            return {
                questionId: wrQuestion._id,
                type: wrQuestion.type,
                question: wrQuestion.question,
                category: wrQuestion.category,
                option1: wrQuestion.option1,
                option2: wrQuestion.option2,
                goodOrBad: wrQuestion.goodOrBad,
            };
        case 'ranking':
            const rankingQuestion = question as IRankingQuestion;
            return {
                questionId: rankingQuestion._id,
                type: rankingQuestion.type,
                question: rankingQuestion.question,
                category: rankingQuestion.category,
                categories: rankingQuestion.categories,
            };
        default:
            return {};
    }
};

/**
 * Helper function to advance to the next question.
 * Emits the next question or ends the game if all questions are done.
 */
const advanceToNextQuestion = async (gameCode: string) => {
    try {
        const game: IGame | null = await Game.findOne({code: gameCode}).populate('questions');
        if (!game || !game.isActive) {
            console.error('Game not found or not active.');
            return;
        }

        // Increment the current question index
        game.currentQuestionIndex += 1;

        // Check if there are more questions
        if (game.currentQuestionIndex >= game.questions.length) {
            // End the game
            game.isActive = false;
            await game.save();

            // Emit game ended event
            io.to(game.code).emit('gameEnded', {message: 'Game has ended.'});

            return;
        }

        // Fetch the next question
        const nextQuestionId = game.questions[game.currentQuestionIndex];
        const nextQuestion = await Question.findById(nextQuestionId);
        if (!nextQuestion) {
            console.error('Next question not found.');
            return;
        }

        // Emit the next question
        io.to(game.code).emit('newQuestion', formatQuestionForClient(nextQuestion));

        // Optionally, set a timer for the next question
        setTimeout(() => {
            advanceToNextQuestion(game.code);
        }, game.settings.timeLimit * 1000);
    } catch (error) {
        console.error('Error advancing to next question:', error);
    }
};

/**
 * Controller to submit an answer.
 * Expects `gameCode` in URL params and `userUuid`, `questionId`, `answer` in the body.
 */
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;
        const {userUuid, questionId, answer} = req.body;

        // Validate input
        if (!userUuid || !questionId || !answer) {
            res.status(400).json({message: 'userUuid, questionId, and answer are required.'});
            return;
        }

        // Find the game by code
        const game: IGame | null = await Game.findOne({code}).populate('questions');
        if (!game) {
            res.status(404).json({message: 'Game not found.'});
            return;
        }

        if (!game.isActive) {
            res.status(400).json({message: 'Game is not active.'});
            return;
        }

        // Get the current question
        const currentQuestionId = game.questions[game.currentQuestionIndex];
        const currentQuestion = await Question.findById(currentQuestionId);
        if (!currentQuestion) {
            res.status(404).json({message: 'Current question not found.'});
            return;
        }

        // Check if the questionId matches the current question
        if (currentQuestion._id.toString() !== questionId) {
            res.status(400).json({message: 'Invalid question ID.'});
            return;
        }

        // Check if the user has already submitted an answer for this question
        const existingAnswer = game.answers.find(
            (ans) => ans.userUuid === userUuid && ans.questionId.toString() === questionId
        );
        if (existingAnswer) {
            res.status(400).json({message: 'User has already submitted an answer for this question.'});
            return;
        }

        // Determine if the answer is correct (if applicable)
        let isCorrect: boolean | undefined = undefined;
        let pointsAwarded: number = 0;

        if (currentQuestion.type === 'multiple-choice') {
            const mcQuestion = currentQuestion as IMultipleChoiceQuestion;
            if (mcQuestion.correctOptionIndex !== undefined) {
                const correctAnswer = mcQuestion.options[mcQuestion.correctOptionIndex];
                isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                pointsAwarded = isCorrect ? 10 * game.settings.punishmentMultiplier : 0;
            }
        }

        // Create an answer object
        const answerObj: IAnswer = {
            userUuid,
            questionId: currentQuestion._id,
            answer,
            isCorrect,
            pointsAwarded,
        };

        // Add the answer to the game
        game.answers.push(answerObj);
        await game.save();

        // Update player's points if the answer is correct
        if (isCorrect && pointsAwarded > 0) {
            const player: IPlayer | null = await Player.findOne({uuid: userUuid});
            if (player) {
                player.points += pointsAwarded;
                await player.save();

                // Notify the player about their updated points
                if (player.socketId) {
                    io.to(player.socketId).emit('pointsUpdated', {points: player.points});
                }
            }
        }

        // Notify all players in the game that a player has answered
        io.to(game.code).emit('playerAnswered', {userUuid, questionId, answer});

        res.status(200).json({message: 'Answer submitted successfully.'});

        // Optionally, check if all players have answered and proceed to next question
        const totalPlayers = game.players.length;
        const totalAnswers = game.answers.filter((a) => a.questionId.toString() === questionId).length;

        if (totalAnswers >= totalPlayers) {
            // All players have answered, proceed to next question
            advanceToNextQuestion(game.code);
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to fetch the current game state.
 * Useful for frontend to sync game status.
 */
export const getGameState = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;

        // Find the game by code and populate players and questions
        const game: IGame | null = await Game.findOne({code})
            .populate({
                path: 'players',
                select: 'uuid name avatar points',
            })
            .populate({
                path: 'questions',
                select: 'type question category options correctOptionIndex option1 option2 goodOrBad categories',
            });

        if (!game) {
            res.status(404).json({message: 'Game not found.'});
            return;
        }

        res.status(200).json({
            game: {
                code: game.code,
                creatorUuid: game.creatorUuid,
                settings: game.settings,
                players: game.players,
                questions: game.questions,
                answers: game.answers,
                currentQuestionIndex: game.currentQuestionIndex,
                isActive: game.isActive,
                createdAt: game.createdAt,
                updatedAt: game.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching game state:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};
