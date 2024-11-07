import Game, {
    generateUniqueGameCode,
    IAnswer,
    IGame,
    IGameSettings,
    ILeaderboardEntry,
    IMemoryGame,
    IPunishment,
    IRound,
    ISequenceMemoryGame
} from '../models/Game';
import Player, {IPlayer} from '../models/Player';
import {OperationResult} from "../types";
import {getQuestionById, getQuestions, prepareQuestions} from "./questionController";
import {getEmojis} from "../utils/emojis";
import {calculatePointsForMiniGames, calculatePointsForQuestion} from "./calculatePoints";

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

        const rounds: IRound[] = [];


        if (gameSettings.gameModes.includes('hide-and-seek')) {
            //for every 10 rounds, add a hide and seek round (gameSettings.numberOfRounds/10)
            for (let i = 0; i < gameSettings.numberOfRounds / 5; i++) {

                //make 50/50 if the round is added or not
                if (Math.random() > 0.5) {
                    rounds.push({
                        type: 'mini-game',
                        data: {
                            type: 'hide-and-seek',
                        },
                    });
                }
            }
        }
        if (gameSettings.gameModes.includes('memory')) {

            let pairs: string[] = [];

            for (let i = 0; i < gameSettings.numberOfRounds / 5; i++) {
                switch (gameSettings.timeLimit) {
                    case 15:
                        pairs = getEmojis(4)
                        break;
                    case 30:
                        pairs = getEmojis(6)
                        break;
                    case 60:
                        pairs = getEmojis(6)
                        break
                    case 90:
                        pairs = getEmojis(8)
                        break;
                    default:
                        pairs = getEmojis(6)
                }


                const memory: IMemoryGame = {
                    type: 'memory',
                    pairs: pairs
                }
                //make 50/50 if the round is added or not
                if (Math.random() > 0.5) {

                    rounds.push({
                        type: 'mini-game',
                        data: memory
                    });
                }
            }
        }
        if (gameSettings.gameModes.includes('sequence-memory')) {

            const createSequence = (lamps: number, length: number) => {
                //create a sequence of length length with lamps lamps
                let sequence: number[] = [];
                for (let i = 0; i < length; i++) {
                    sequence.push(Math.floor(Math.random() * lamps));
                }
                return sequence;
            }

            let sequence: number[] = [];
            let lamps: number = 0;

            for (let i = 0; i < gameSettings.numberOfRounds / 5; i++) {
                switch (gameSettings.timeLimit) {
                    case 15:
                        lamps = 6
                        sequence = createSequence(lamps, 6)
                        break;
                    case 30:
                        lamps = 6
                        sequence = createSequence(lamps, 6)
                        break;
                    case 60:
                        lamps = 9
                        sequence = createSequence(lamps, 8)
                        break
                    case 90:
                        lamps = 9
                        sequence = createSequence(lamps, 10)
                        break;
                    default:
                        lamps = 6
                }


                const sequenceMemory: ISequenceMemoryGame = {
                    type: 'sequence-memory',
                    lamps: lamps,
                    sequence: sequence
                }
                //make 50/50 if the round is added or not
                if (Math.random() > 0.5) {

                    rounds.push({
                        type: 'mini-game',
                        data: sequenceMemory
                    });
                }
            }
        }

        console.log(rounds);

        // Fetch questions based on game settings
        const filters = {
            types: gameSettings.gameModes, // Corrected
            limit: gameSettings.numberOfRounds - rounds.length,
        };

        const fetchedQuestions = await getQuestions(filters);

        if (!fetchedQuestions.success) {
            console.error('[ERROR] Fetching questions:', fetchedQuestions.error);
            return {success: false, error: 'Error fetching questions.'};
        }

        //random sort rounds


        // Initialize leaderboard with the creator
        const leaderboard: ILeaderboardEntry[] = [{playerId: creator._id, totalPoints: 0}];
        // Create a new game object
        const newGame = new Game({
            code: await generateUniqueGameCode(), // Generate unique game code
            creatorId: creator._id,
            questions: fetchedQuestions.data!.map(q => q._id), // Store question IDs
            settings: gameSettings,
            players: [creator._id],
            leaderboard: leaderboard,
            rounds: rounds,
            isActive: true,
            currentQuestionIndex: 0,
            state: 'lobby', // Game starts in the lobby state
        });


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

            const question = preparedQuestionResult.data!;

            game.rounds.push({
                type: 'question',
                data: question,
            })

        }

        //shuffle the rounds
        game.rounds = game.rounds.sort(() => Math.random() - 0.5);

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

    if (game.currentRoundIndex >= game.rounds.length) {
        // All questions answered, move to leaderboard
        game.state = 'leaderboard';
        game.isActive = false;
        await game.save();
        io.to(game.code).emit('game:state', {game: game});
        return;
    }

    // Set game state to "quiz" and emit the question to players
    game.state = 'round';

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
    if (!game || game.state !== 'round') return;
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
    updatedGame!.punishments[updatedGame!.currentRoundIndex] = punishments; // Save punishment string
    updatedGame!.answers[updatedGame!.currentRoundIndex] = answers; // Save calculated answers

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

        const currentRound: IRound = game.rounds[game.currentRoundIndex];

        //check if round is minigame or question round (is type MiniGameType or QuestionType)
        if (currentRound.type === 'mini-game') {
            return calculatePointsForMiniGames(gameCode);

        } else {
            // Calculate points for the current question
            return calculatePointsForQuestion(gameCode);

        }

    } catch (error) {
        console.error('Error calculating points:', error);
        return {success: false, error: 'Internal server error'};
    }
};

