import Game, {
    generateUniqueGameCode,
    IAnswer,
    IGame,
    IGameSettings,
    ILeaderboardEntry,
    IPunishment
} from '../models/Game';
import Player, {IPlayer} from '../models/Player';
import {OperationResult} from "../types";
import {getQuestionById, getQuestions, prepareQuestions} from "./questionController";
import {
    ICleanMultipleChoiceQuestion,
    ICleanRankingQuestion,
    ICleanWhoWouldRatherQuestion,
    IMultipleChoiceQuestion,
    IRankingQuestion,
    IWhatWouldYouRatherQuestion
} from "../models/Question";

// Timer storage object to track active timers for each game
export const gameTimers: { [gameCode: string]: NodeJS.Timeout } = {};

/**
 * Create a new game with the given creator and optional settings.
 */
export const createGame = async (creatorId: string, settings?: any): Promise<OperationResult<IGame>> => {
    try {
        // Find the player who will be the creator of the game
        const creator = await Player.findById(creatorId);
        if (!creator) {
            console.error(`[ERROR] Creator not found with ID: ${creatorId}`);
            return {success: false, error: 'Creator not found.'};
        }

        // Set default settings if none are provided
        const defaultSettings = {
            numberOfQuestions: 10,
            gameModes: ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'], // Corrected
            timeLimit: 30,
            punishmentMultiplier: 1,
        };
        const gameSettings: IGameSettings = settings || defaultSettings;
        console.log(`GameSettings from Frontend`);
        console.log(gameSettings);

        //check if gameModes include hide-and-seek, spy, memory
        if (gameSettings.gameModes.includes('hide-and-seek') /*|| gameSettings.gameModes.includes('spy') || gameSettings.gameModes.includes('memory'*/) {


        }


        // Fetch questions based on game settings
        const filters = {
            types: gameSettings.gameModes, // Corrected
            limit: gameSettings.numberOfQuestions,
        };
        const fetchedQuestions = await getQuestions(filters);

        if (!fetchedQuestions.success) {
            console.error('[ERROR] Fetching questions:', fetchedQuestions.error);
            return {success: false, error: 'Error fetching questions.'};
        }

        // Initialize leaderboard with the creator
        const leaderboard: ILeaderboardEntry[] = [{playerId: creator._id, totalPoints: 0}];
        // Create a new game object
        const newGame = new Game({
            code: await generateUniqueGameCode(), // Generate unique game code
            creatorId: creator._id,
            questions: fetchedQuestions.data!.map(q => q._id), // Store question IDs
            settings: gameSettings,
            players: [creator._id],
            leaderboard,
            isActive: true,
            currentQuestionIndex: 0,
            state: 'lobby', // Game starts in the lobby state
        });

        console.log(`Game that is being created `);
        console.log(newGame);

        await newGame.save();

        // Update creator's gameCode
        creator.gameCode = newGame.code;
        await creator.save();

        // Populate the game with player data
        const populatedGame = await Game.findById(newGame._id)
            .populate('players', 'name avatar points');

        console.log(`[GAME] Game created with code: ${newGame.code} by player: ${creatorId}`);
        return {success: true, data: populatedGame!};
    } catch (error) {
        console.error('[ERROR] Creating game:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Join an existing game by game code.
 */
export const joinGame = async (gameCode: string, playerId: string): Promise<OperationResult<IGame>> => {
    try {
        // Find game and player
        const game = await Game.findOne({code: gameCode});
        if (!game) {
            return {success: false, error: 'Game not found.'};
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        // Check if player is already in the game
        if (game.players.includes(player._id)) {
            return {success: false, error: 'Player is already in the game.'};
        }

        // Check if the game is still in the lobby and active
        if (game.state !== 'lobby' || !game.isActive) {
            return {success: false, error: 'Cannot join anymore, create a new one.'};
        }

        // Add player to game and leaderboard
        game.players.push(player._id);
        game.leaderboard.push({playerId: player._id, totalPoints: 0});

        player.gameCode = game.code;
        await player.save();
        await game.save();

        // Populate game with updated player data
        const populatedGame = await Game.findById(game._id)
            .populate('players', 'name avatar points');

        console.log(`[GAME] Player ${playerId} joined game ${gameCode}`);
        return {success: true, data: populatedGame!};
    } catch (error) {
        console.error('[ERROR] Joining game:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Leave an existing game by game code.
 */
export const leaveGame = async (gameCode: string, playerId: string): Promise<OperationResult<{
    player: IPlayer,
    game: IGame
}>> => {
    try {
        // Find game and player
        const game = await Game.findOne({code: gameCode});
        if (!game) {
            return {success: false, error: 'Game not found.'};
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        player.gameCode = undefined;
        await player.save();

        // If the player is the last one, deactivate the game
        if (game.players.length === 1) {
            game.isActive = false;
            await game.save();
            console.log(`[GAME] Last player ${playerId} left, game ${gameCode} deactivated.`);
            return {success: true, data: {player, game}};
        }

        // Reassign the game creator if necessary
        if (game.creatorId.toString() === player._id.toString()) {
            const nextPlayer = game.players.find(p => p.toString() !== player._id.toString());
            if (nextPlayer) {
                game.creatorId = nextPlayer;
            }
        }

        // Remove player from the game
        game.players = game.players.filter(p => p.toString() !== player._id.toString());
        await game.save();

        const populatedGame = await Game.findById(game._id)
            .populate('players', 'name avatar points');

        console.log(`[GAME] Player ${playerId} left game ${gameCode}`);
        return {success: true, data: {player, game: populatedGame!}};
    } catch (error) {
        console.error('[ERROR] Leaving game:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Kick a player from a game by game code.
 */
export const kickPlayer = async (gameCode: string, playerId: string): Promise<OperationResult<{
    game: IGame,
    kickedPlayer: IPlayer
}>> => {
    try {
        // Find player and game
        const player = await Player.findById(playerId);
        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        const game = await Game.findOne({code: gameCode});
        if (!game) {
            return {success: false, error: 'Game not found.'};
        }

        // Remove player from game and leaderboard
        game.players = game.players.filter(p => p.toString() !== playerId);
        game.leaderboard = game.leaderboard.filter(p => p.playerId.toString() !== playerId);
        await game.save();

        player.gameCode = undefined;
        await player.save();

        const populatedGame = await Game.findById(game._id)
            .populate('players', 'name avatar points');

        console.log(`[GAME] Player ${playerId} was kicked from game ${gameCode}`);
        return {success: true, data: {game: populatedGame!, kickedPlayer: player!}};
    } catch (error) {
        console.error('[ERROR] Kicking player:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Start game and move to waiting state.
 */
export const startGame = async (gameCode: string, io: any): Promise<OperationResult<IGame>> => {
    try {
        const game = await Game.findOne({code: gameCode, isActive: true}).populate('players', 'name avatar points');
        if (!game) {
            return {success: false, error: 'Game not found'};
        }

        // Fetch and prepare each question
        for (let i = 0; i < game.questions.length; i++) {
            const fullQuestions = await getQuestionById(game.questions[i].toString());
            if (!fullQuestions.success) {
                console.error('Error fetching full question:', fullQuestions.error);
                return {success: false, error: 'Error fetching full questions'};
            }

            // Prepare questions and ensure correctOptionIndex is set for multiple-choice
            const preparedQuestionResult = await prepareQuestions(fullQuestions.data!, (game.players as unknown as IPlayer[]));

            if (!preparedQuestionResult.success) {
                console.error('Error preparing question:', preparedQuestionResult.error);
                return {success: false, error: 'Error preparing question'};
            }

            game.cleanedQuestions.push(preparedQuestionResult.data!); // Add the cleaned question to the game
        }

        // Set the game state to "waiting"
        game.state = 'waiting';
        await game.save();

        console.log(`[GAME] Game ${gameCode} started.`);

        // Load the first question after a short delay
        setTimeout(async () => {
            await loadNextQuestion(game.code, io);
            console.log(`[GAME] Loading first question for game ${gameCode}`);
        }, 1000);

        return {success: true, data: game};
    } catch (error) {
        console.error('Error starting game:', error);
        return {success: false, error: 'Internal server error'};
    }
};

/**
 * Load the next question in the game.
 */
export const loadNextQuestion = async (gameCode: string, io: any) => {
    const game = await Game.findOne({code: gameCode, isActive: true}).populate('players', 'name avatar points');

    if (!game) return;

    if (game.currentQuestionIndex >= game.questions.length) {
        // All questions answered, move to leaderboard
        game.state = 'leaderboard';
        game.isActive = false;
        await game.save();
        io.to(game.code).emit('game:state', {game: game});
        return;
    }

    // Set game state to "quiz" and emit the question to players
    game.state = 'quiz';

    // Set question time limit +1 extra second for better timing
    game.timeRemaining = new Date(Date.now() + (game.settings.timeLimit + 1) * 1000);

    // Reset playersAnswered for the new question
    game.playersAnswered = [];
    await game.save();

    io.to(game.code).emit('game:state', {game});

    // Start timer for the current question
    startQuestionTimer(game, io);
};

/**
 * Start timer for the current question.
 */
const startQuestionTimer = (game: IGame, io: any) => {
    // If a timer already exists for this game, clear it first
    if (gameTimers[game.code]) {
        clearTimeout(gameTimers[game.code]);
        delete gameTimers[game.code]; // Remove the timer from storage
        console.log(`[GAME] Timer for game ${game.code} cleared.`);
    }

    // Calculate time limit for the new question
    const timeLimit = game.timeRemaining.getTime() - Date.now() - 500;
    console.log(`[GAME] Starting question timer for game ${game.code} with time limit: ${timeLimit} ms`);

    // Set and store the timer for the current game
    gameTimers[game.code] = setTimeout(async () => {
        await handleResults(game.code, io);
        console.log(`[GAME] Timer expired for game ${game.code}.`);
    }, timeLimit); // Store the timer
};

/**
 * Handle results after the timer for the question ends.
 */
export const handleResults = async (gameCode: string, io: any) => {
    const game = await Game.findOne({code: gameCode, isActive: true}).populate('players', 'name avatar points');
    if (!game || game.state !== 'quiz') return;
    clearTimeout(gameTimers[game.code]);
    delete gameTimers[gameCode]

    game.state = 'waiting';
    await game.save();

    io.to(game.code).emit('game:state', {game});
    console.log(`[GAME] Question timer expired for game ${game.code}`);

    // Calculate points for the current question
    const result = await calculatePoints(game.code);
    if (!result.success) {
        console.error('Error calculating points:', result.error);
        return;
    }
    const {answers, punishments} = result.data!;

    const updatedGame = await Game.findOne({code: game.code, isActive: true})
        .populate('players', 'name avatar points');
    updatedGame!.punishments[updatedGame!.currentQuestionIndex] = punishments; // Save punishment string
    updatedGame!.answers[updatedGame!.currentQuestionIndex] = answers; // Save calculated answers

    answers.forEach(answer => {
        const leaderboardEntry = updatedGame!.leaderboard.find(entry => entry.playerId.toString() === answer.playerId.toString());
        if (leaderboardEntry) {
            leaderboardEntry.totalPoints += answer.pointsAwarded || 0; // Update leaderboard points
        }
    });

    updatedGame!.leaderboard.sort((a, b) => b.totalPoints - a.totalPoints); // Sort leaderboard by points
    updatedGame!.state = 'results';
    await updatedGame!.save();

    io.to(game.code).emit('game:state', {game: updatedGame});
};


/**
 * Calculate points based on answers to the current question.
 */
const calculatePoints = async (gameCode: string): Promise<OperationResult<{
    answers: IAnswer[],
    punishments: IPunishment[]
}>> => {
    try {
        const game = await Game.findOne({code: gameCode, isActive: true});
        if (!game) {
            return {success: false, error: 'Game not found'};
        }

        const currentQuestionId = game.questions[game.currentQuestionIndex];
        const result = await getQuestionById(currentQuestionId.toString());
        if (!result.success) {
            console.error('Error fetching current question:', result.error);
            return {success: false, error: 'Error fetching current question'};
        }
        const currentQuestion = result.data!;

        if (currentQuestion.type === 'multiple-choice') {
            console.log('Correct Option Index:', currentQuestion.correctOptionIndex);

            const currentCleanedQuestion = game.cleanedQuestions[game.currentQuestionIndex] as ICleanMultipleChoiceQuestion;
            currentCleanedQuestion.correctOptionIndex = currentQuestion.correctOptionIndex;
            game.cleanedQuestions[game.currentQuestionIndex] = currentCleanedQuestion;
            await game.save();
        }

        const answers: IAnswer[] = game.answers[game.currentQuestionIndex] || [];
        let whoWouldRatherQuestion = currentQuestion.type === 'who-would-rather' ? game.cleanedQuestions[game.currentQuestionIndex] as ICleanWhoWouldRatherQuestion : null;

        // Players who didn't answer
        const playersNotAnswered = game.players
            .filter(p => !game.playersAnswered.includes(p))
            .map(p => ({
                playerId: p,
                questionId: currentQuestionId,
                answer: '__NOT_ANSWERED__',
                answeredAt: new Date(),
                isCorrect: false,
                pointsAwarded: 0,
            }));

        answers.push(...playersNotAnswered);
        const multiplier = game.settings.punishmentMultiplier;

        let updatedAnswers: IAnswer[] = [];
        let punishments: IPunishment[] = [];

        switch (currentQuestion.type) {
            case 'multiple-choice':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleMultipleChoice(currentQuestion, answers, multiplier));
                break;

            case 'what-would-you-rather':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhatWouldYouRather(currentQuestion, answers, multiplier));
                break;

            case 'who-would-rather':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhoWouldRather(whoWouldRatherQuestion!, answers, multiplier));
                break
            case 'ranking':
                const {
                    _answers,
                    _punishments,
                    finalRanking
                } = handleRanking(currentQuestion, answers, multiplier);

                const currentCleanedQuestion = game.cleanedQuestions[game.currentQuestionIndex] as ICleanRankingQuestion;
                currentCleanedQuestion.finalRanking = finalRanking;
                // Explicitly mark the modified path
                game.cleanedQuestions[game.currentQuestionIndex] = currentCleanedQuestion;
                game.markModified(`cleanedQuestions.${game.currentQuestionIndex}.finalRanking`);
                game.markModified('cleanedQuestions');

                await game.save();

                updatedAnswers = _answers;
                punishments = _punishments;
                break;

            default:

                return {success: false, error: 'Invalid question type'};
        }

        return {
            success: true,
            data: {
                answers: updatedAnswers,
                punishments: punishments,
            },
        };

    } catch (error) {
        console.error('Error calculating points:', error);
        return {success: false, error: 'Internal server error'};
    }
};


/**
 * Handle ranking question by combining individual rankings into a final ranking,
 * calculating points, and applying punishments based on "goodOrBad" attribute.
 */
const handleRanking = (
    question: IRankingQuestion,
    answers: IAnswer[],
    multiplier: number
): { _answers: IAnswer[], _punishments: IPunishment[], finalRanking: string[] } => {
    const noAnswerPlayers: IPunishment[] = [];
    const rankingMap: Map<string, number> = new Map(); // Map to store cumulative rank points for each player

    // Handle players who didn’t answer
    answers.forEach(answer => {
        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else {
            // Sum rankings for each player who answered
            const rankedPlayers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
            rankedPlayers.forEach((playerId, rankIndex) => {
                const currentRank = rankingMap.get(playerId) || 0;
                rankingMap.set(playerId, currentRank + rankIndex + 1); // +1 to make ranks 1-based
            });
        }
    });

    // Aggregate rankings and sort players by rank points (lowest = best rank)
    const finalRanking = Array.from(rankingMap.entries())
        .map(([playerId, rankPoints]) => ({playerId, rankPoints}))
        .sort((a, b) => a.rankPoints - b.rankPoints);

    // Calculate max possible deviation for normalization
    const maxDeviation = finalRanking.length * (finalRanking.length - 1) / 2;

    const punishments: IPunishment[] = [];
    answers.forEach(answer => {
        if (answer.answer && answer.answer !== "__NOT_ANSWERED__") {
            const playerRanking = Array.isArray(answer.answer) ? answer.answer : [answer.answer];

            // Calculate deviation from final ranking
            let deviation = 0;
            playerRanking.forEach((playerId, index) => {
                const finalRank = finalRanking.findIndex(r => r.playerId === playerId);
                deviation += Math.abs(index - finalRank);
            });

            // Calculate normalized score out of 500 points
            const score = Math.max(0, 500 - Math.floor((deviation / maxDeviation) * 500));
            answer.pointsAwarded = score;

            // Apply base punishments based on the score
            let punishment: IPunishment | null;
            if (score === 500) {
                punishment = {
                    playerId: answer.playerId,
                    give: 2 * multiplier,
                    reasons: [`Perfection 🤩 – give ${2 * multiplier} sips!`]
                };
            } else if (score >= 400) {
                punishment = {
                    playerId: answer.playerId,
                    give: multiplier,
                    reasons: [`Close to Perfection ☺️ – give ${multiplier} sips!`]
                };
            } else if (score >= 200) {
                punishment = {
                    playerId: answer.playerId,
                    take: multiplier,
                    reasons: [`Not so good 🤨 – take ${multiplier} sips!`]
                };
            } else if (score >= 1) {
                punishment = {
                    playerId: answer.playerId,
                    take: 2 * multiplier,
                    reasons: [`Bad Ranking ☹️ – take ${2 * multiplier} sips!`]
                };
            } else {
                punishment = {
                    playerId: answer.playerId,
                    take: 3 * multiplier,
                    reasons: [`FOR REAL 😂 – take ${3 * multiplier} sips!`]
                };
            }

            if (punishment) {
                punishments.push(punishment);
            }
        }
    });

    // Additional points adjustments and updated punishments based on `goodOrBad`
    const adjustmentFactor = 100; // Base adjustment factor for points
    const sortedFinalRanking = finalRanking.sort((a, b) => a.rankPoints - b.rankPoints); // Sort by best rank

    sortedFinalRanking.forEach((rank, index) => {
        const player = answers.find(answer => answer.playerId.toString() === rank.playerId);
        if (!player) return;

        const adjustment = adjustmentFactor * (sortedFinalRanking.length - index - 1);

        if (question.goodOrBad === 'good') {
            // Reward players in top positions
            player.pointsAwarded! += adjustment;

            // Update existing punishment to add rewards based on ranking
            const playerPunishment = punishments.find(p => p.playerId.toString() === rank.playerId);
            if (playerPunishment) {
                if (index === 0) {
                    playerPunishment.give = 3 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #1 😇 – give ${3 * multiplier} sips!`);
                } else if (index === 1) {
                    playerPunishment.give = 2 * multiplier;
                    playerPunishment.reasons.push(`>ou've been ranked #2 ☺️ – give ${2 * multiplier} sips!`);
                } else if (index === 2) {
                    playerPunishment.give = multiplier;
                    playerPunishment.reasons.push(`You've been ranked #3 👏🏼 – give ${multiplier} sips!`);
                }
            }
        } else if (question.goodOrBad === 'bad') {
            // Penalize players in top positions
            player.pointsAwarded! -= adjustment;

            // Update existing punishment to add penalties based on ranking
            const playerPunishment = punishments.find(p => p.playerId.toString() === rank.playerId);
            if (playerPunishment) {
                if (index === 0) {
                    playerPunishment.take = 3 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #1 🫣🫵 – give ${3 * multiplier} sips!`);
                } else if (index === 1) {
                    playerPunishment.take = 2 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #2 🤨🫵 – give ${2 * multiplier} sips!`);
                } else if (index === 2) {
                    playerPunishment.take = multiplier;
                    playerPunishment.reasons.push(`You've been ranked #3 🫠🫵 – give ${multiplier} sips!`);
                }
            }
        }
    });

    const finalRankingArray = sortedFinalRanking.map((rank) => {
        return rank.playerId
    })

    return {
        _answers: answers,
        _punishments: [...punishments, ...noAnswerPlayers],
        finalRanking: finalRankingArray
    };
};

/**
 * Handle multiple-choice question punishment and point calculation.
 */
const handleMultipleChoice = (
    question: IMultipleChoiceQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const correctAnswer = question.options[question.correctOptionIndex];

    // Sort answers by time for bonus points
    answers.sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

    const bonusPoints = [50, 25, 10]; // Bonus points for the first three correct answers
    let correctAnswersCount = 0;
    let noAnswerCount = 0;
    let wrongAnswersCount = 0;

    // Arrays to track players for punishments
    let noAnswerPlayers: IPunishment[] = [];
    let wrongAnswerPlayers: IPunishment[] = [];
    let correctAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.isCorrect = false;
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300; // Deduct points for not answering
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else if (answer.answer === correctAnswer) {
            // Correct answer
            answer.isCorrect = true;
            answer.pointsAwarded = 100; // Base points for correct answer
            if (correctAnswersCount < 3) {
                answer.pointsAwarded += bonusPoints[correctAnswersCount]; // Bonus points for top 3
            }
            correctAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: []
            });
            correctAnswersCount++;
        } else {
            // Incorrect answer
            wrongAnswersCount++;
            answer.pointsAwarded = -100; // Deduct points for incorrect answer
            wrongAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Answered incorrectly – drink ${multiplier} sip(s)`],
                take: multiplier
            });
        }
    });

    // If everyone answered incorrectly, everyone drinks 3 sips
    if (correctAnswersCount === 0) {
        noAnswerPlayers.forEach(player => {
            player.take = 3 * multiplier;
            player.reasons.push(`Everyone answered wrong – drink ${3 * multiplier} sips`);
        });
        wrongAnswerPlayers.forEach(player => {
            player.take = 3 * multiplier;
            player.reasons.push(`Everyone answered wrong – drink ${3 * multiplier} sips`);
        });
    }

    // Bonus: If only one player answered correctly, they can give 2 sips
    if (correctAnswerPlayers.length === 1) {
        correctAnswerPlayers[0].give = 2 * multiplier;
        correctAnswerPlayers[0].reasons.push(`Only correct answer – give ${2 * multiplier} sip(s)`);
    }

    // If only one player didn’t answer, they drink 2 more sips
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += 2 * multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${2 * multiplier} extra sips`);
    }

    // If only one player answered incorrectly, they drink 2 more sips
    if (wrongAnswersCount === 1 && noAnswerCount === 0) {
        wrongAnswerPlayers[0].take! += multiplier;
        wrongAnswerPlayers[0].reasons.push(`Only player who answered wrong – drink ${multiplier} extra sip(s)`);
    }

    // If all players answered correctly, the fastest player gives 1 sip
    if (noAnswerCount === 0 && wrongAnswersCount === 0 && correctAnswerPlayers.length > 0) {
        correctAnswerPlayers[0].give = multiplier; // Fastest player gives a sip
        correctAnswerPlayers[0].reasons = correctAnswerPlayers[0].reasons || []; // Ensure reasons array exists
        correctAnswerPlayers[0].reasons.push(`Fastest 🚀 – give ${multiplier} sip(s)`);
    }

    // If all players answered incorrectly, the slowest player takes 1 extra sip
    if (noAnswerCount === 0 && correctAnswersCount === 0 && wrongAnswerPlayers.length > 0) {
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].take! += multiplier; // Slowest player takes an extra sip
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].reasons!.push(`Slowest and wrong 🐢 – drink ${multiplier} extra sip(s)`);
    }

    // Prepare the final punishments array by combining all players, ensuring correct answer players are added
    const correctAnswerPunishments = correctAnswerPlayers.map((player, index) => ({
        playerId: player.playerId,
        reasons: [...(player.reasons || []), `Answered correctly as #${index + 1}`], // Add index to reasons
        give: player.give || undefined, // Only include give if it exists
    }));

    // Combine all punishment arrays
    const punishments = [...noAnswerPlayers, ...wrongAnswerPlayers, ...correctAnswerPunishments];

    return {
        answers,
        punishments
    };
};
/**
 * Handle What Would you Rather question punishment and point calculation.
 */
const handleWhatWouldYouRather = (
    question: IWhatWouldYouRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const option1 = question.options[0];
    const option2 = question.options[1];

    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    // Arrays to track players for points and punishments
    let option1Players: IPunishment[] = [];
    let option2Players: IPunishment[] = [];
    let noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300; // Deduct points for not answering
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer 🤦🏻‍♂️ ${2 * multiplier}`],
                take: 2 * multiplier
            });
        } else if (answer.answer === option1) {
            option1Votes++;
            option1Players.push({
                playerId: answer.playerId,
                reasons: [],
            });
        } else if (answer.answer === option2) {
            option2Votes++;
            option2Players.push({
                playerId: answer.playerId,
                reasons: [],
            });
        }
    });

    // Handle point awarding
    const totalVotes = option1Votes + option2Votes;

    // Check for tie (equal number of votes)
    const isTie = option1Votes === option2Votes && totalVotes > 0;

    if (!isTie && totalVotes > 0) {
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;

        majorityPlayers.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded = 100 * multiplier; // Award points for being in the majority
            }
        });
    }

    // Handle punishments
    const punishments: IPunishment[] = [];

    if (isTie) {
        // If there is a tie, everyone drinks
        const tiedPlayers = [...option1Players, ...option2Players];
        tiedPlayers.forEach((player) => {
            player.take = multiplier;
            player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            punishments.push(player);
        });
    } else {
        // Handle majority and minority punishments
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;
        const minorityPlayers = option1Votes > option2Votes ? option2Players : option1Players;

        majorityPlayers.forEach((player, index) => {
            player.reasons.push(`In the majority (#${index + 1})`);
            punishments.push(player);
        });

        minorityPlayers.forEach((player) => {
            player.take = 2 * multiplier;
            player.reasons.push(`In the minority – drink ${2 * multiplier} sip(s) 🍷`);
            punishments.push(player);
        });

        // If one option has only one vote and all players answered, the lonely one should get extra sips
        if (minorityPlayers.length === 1) {
            minorityPlayers[0].take! += 2 * multiplier;
            minorityPlayers[0].reasons.push(`All alone in the minority – drink ${2 * multiplier} more sip(s) 🥲`);
        }
    }

    // If only one player didn’t answer, they drink more sips
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += 2 * multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${2 * multiplier} more sip(s) 🥸`);
        punishments.push(...noAnswerPlayers);
    } else {
        punishments.push(...noAnswerPlayers);
    }

    return {
        answers,
        punishments
    };
};
/**
 * Handle Who Would you Rather question punishment and point calculation.
 */
const handleWhoWouldRather = (
    question: ICleanWhoWouldRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    console.log(answers);
    console.log(question);

    console.log(answers)


    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    let optionOneWon = null


    // Arrays to track players for points and punishments
    let option1Players: IPunishment[] = [];
    let option2Players: IPunishment[] = [];
    let noAnswerPlayers: IPunishment[] = [];
    const punishments: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0
        if (answer.answer === question.options[0]) {
            option1Votes++;
            option1Players.push({
                playerId: answer.playerId,
                reasons: [],
                take: 0,
                give: 0
            });
        } else if (answer.answer === question.options[1]) {
            option2Votes++;
            option2Players.push({
                playerId: answer.playerId,
                reasons: [],
                take: 0,
                give: 0
            });
        } else {
            noAnswerCount++;
            answer.pointsAwarded = -300
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        }
    })


    //check if there is a tie
    if (option1Votes === option2Votes) {
        //no one gets points and everybody has to drink except the two payers
        option1Players.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
        option2Players.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
        noAnswerPlayers.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
    }

    const goodOrBad = question.goodOrBad

    if (option2Votes < option1Votes) {
        // add 100 points to the answer
        option1Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = 100
                }
            });
        });
        option2Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = -50
                }
            });
        });
        optionOneWon = true

    }
    if (option2Players > option1Players) {
        option2Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = 100
                }
            });
        });
        option1Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = -50
                }
            });
        });
        optionOneWon = false
    }

    //if only one player didnt answer, add one sip more
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${multiplier} more sip(s) 🥸`);
    }


    //if only one is in minority and all answered he gets 2 sips
    if (option2Votes !== option1Votes && option1Votes === 1 && noAnswerCount === 0) {
        option1Players[0].take! += 2 * multiplier;
        option1Players[0].reasons.push(`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`);
    }
    if (option2Votes !== option1Votes && option2Votes === 1 && noAnswerCount === 0) {
        option2Players[0].take! += 2 * multiplier;
        option2Players[0].reasons.push(`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`);
    }
    if (option2Votes === 0 && noAnswerCount === 0) {
        option1Players.forEach((player) => {
            player.take = multiplier
            player.reasons.push(`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`)
        })
    }
    if (option1Votes === 0 && noAnswerCount === 0) {
        option2Players.forEach((player) => {
            player.take = multiplier
            player.reasons.push(`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`)
        })
    }
    if (option2Votes === 0 && option1Votes === 0) {
        option2Players.forEach((player) => {
            player.take = 3 * multiplier
            player.reasons.push(`No one answered 😡 -  ${3 * multiplier} sips`)
        })
        option1Players.forEach((player) => {
            player.take = 3 * multiplier
            player.reasons.push(`No one answered 😡 -  ${3 * multiplier} sips`)
        })
    }

    if (optionOneWon === true) {
        option1Players.forEach((player) => {
            if (player.playerId.toString() === question.options[0]) {
                if (goodOrBad === 'good') {
                    player.give! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                } else {
                    player.take! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                }

            }
        })
        option2Players.forEach((player) => {
            if (player.playerId.toString() === question.options[0]) {
                if (goodOrBad === 'good') {
                    player.give! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                } else {
                    player.take! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                }

            }
        })
    }
    if (optionOneWon === false) {
        {
            option1Players.forEach((player) => {
                if (player.playerId.toString() === question.options[1]) {
                    if (goodOrBad === 'good') {
                        player.give! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                    } else {
                        player.take! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                    }

                }
            })
            option2Players.forEach((player) => {
                if (player.playerId.toString() === question.options[1]) {
                    if (goodOrBad === 'good') {
                        player.give! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                    } else {
                        player.take! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                    }

                }
            })
        }
    }


    punishments.push(...noAnswerPlayers, ...option2Players, ...option1Players)

    return {
        answers,
        punishments
    };
}
