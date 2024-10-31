import {Document, model, Schema} from 'mongoose';
import {ICleanQuestion} from './Question';

/**
 * Enum for Game State
 */
export type GameState = 'lobby' | 'quiz' | 'waiting' | 'perks' | 'results' | 'punishment' | 'leaderboard' | 'aborted';

/**
 * Interface representing the game settings.
 */
export interface IGameSettings {
    numberOfQuestions: number;
    questionTypes: ('multiple-choice' | 'who-would-rather' | 'what-would-you-rather' | 'ranking')[];
    timeLimit: number; // in seconds
    punishmentMultiplier: number; // e.g., 1 for normal, 2 for double
}

/**
 * Interface representing a punishment for a player.
 */
export interface IPunishment {
    playerId: Schema.Types.ObjectId; // References Player._id
    reasons: string[]; // Reasons for the punishment (e.g., "Didn't answer", "Answered wrong")
    give?: number; // Drinks the player can give to others
    take?: number; // Drinks the player has to take
}

/**
 * Interface representing an answer to a question within a game.
 */
export interface IAnswer {
    playerId: Schema.Types.ObjectId; // References Player._id
    questionId: Schema.Types.ObjectId; // References Question._id
    answer: string | string[]; // User's answer
    answeredAt?: Date; // Timestamp of the answer
    isCorrect?: boolean; // Determined based on the question type
    pointsAwarded?: number; // Points awarded for the answer
}

/**
 * Interface representing a leaderboard entry.
 */
export interface ILeaderboardEntry {
    playerId: Schema.Types.ObjectId; // References Player._id
    totalPoints: number; // Total points accumulated by the player
}

/**
 * Interface representing a Game document in MongoDB.
 */
export interface IGame extends Document {
    _id: Schema.Types.ObjectId; // Explicitly define the _id field as ObjectId
    code: string; // 6-character unique game code
    creatorId: Schema.Types.ObjectId; // References the Player model by ObjectId
    settings: IGameSettings; // Game settings
    players: Schema.Types.ObjectId[]; // Array of Player ObjectIds
    questions: Schema.Types.ObjectId[]; // Array of Question ObjectIds
    cleanedQuestions: ICleanQuestion[]; // Cleaned questions (prepared when the game starts)
    answers: IAnswer[][]; // Array of arrays, where each array contains answers for a particular question
    result: string; // The result of the game
    leaderboard: ILeaderboardEntry[]; // Array of leaderboard entries
    currentQuestionIndex: number; // Index of the current question
    state: GameState; // Current state of the game
    timeRemaining: Date; // Time remaining for the current question
    playersAnswered: Schema.Types.ObjectId[];  // Array of players who have answered the current question
    isActive: boolean; // Indicates if the game is ongoing
    punishments: IPunishment[][]; // Punishments applied to players during the game
    createdAt: Date; // Timestamp of game creation
    updatedAt: Date; // Timestamp of last update
}

/**
 * Function to generate a random game code of a given length.
 * Tries 4-char codes for 10 attempts, then 6-char codes for 10 attempts,
 * and falls back to 10-char codes indefinitely until a unique one is found.
 */
export const generateUniqueGameCode = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    // Helper function to generate a random code of a specific length
    const generateCode = (length: number): string => {
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    };

    let attempts = 0;
    let gameCode = '';
    let codeLength = 4; // Start with a 4-character code

    // Loop to find a unique code
    while (true) {
        gameCode = generateCode(codeLength);
        const existingGame = await Game.findOne({code: gameCode});

        // If no existing game is found with the generated code, it is unique
        if (!existingGame) {
            break;
        }

        attempts++;

        // After 10 failed attempts with the current length, switch to the next length
        if (attempts === 10 && codeLength === 4) {
            codeLength = 6; // Switch to 6-character codes
            attempts = 0; // Reset attempts
        } else if (attempts === 10 && codeLength === 6) {
            codeLength = 10; // Switch to 10-character codes
            attempts = 0; // Reset attempts, but stay with 10-char codes indefinitely
        }
    }

    return gameCode;
};

/**
 * Mongoose Schema for Game Settings.
 */
const GameSettingsSchema: Schema = new Schema({
    numberOfQuestions: {type: Number, required: true, default: 10},
    questionTypes: {
        type: [
            {
                type: String,
                enum: ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'],
                required: true,
            },
        ],
        required: true,
        default: ['multiple-choice'],
    },
    timeLimit: {type: Number, required: true, default: 30}, // default 30 seconds
    punishmentMultiplier: {type: Number, required: true, default: 1}, // default no multiplier
});

/**
 * Mongoose Schema for Answer.
 */
const AnswerSchema: Schema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'}, // Reference to the Player model
    questionId: {type: Schema.Types.ObjectId, required: true, ref: 'Question'}, // Reference to the Question model
    answer: {type: Schema.Types.Mixed, required: true}, // Allows both string and array of strings
    isCorrect: {type: Boolean},
    pointsAwarded: {type: Number},
    answeredAt: {type: Date, default: Date.now}, // Automatically add answeredAt when the answer is created
}, {_id: false});

/**
 * Mongoose Schema for Leaderboard.
 */
const LeaderboardSchema: Schema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'}, // Reference to the Player model
    totalPoints: {type: Number, required: true}, // Total points accumulated by the player
}, {_id: false});

/**
 * Mongoose Schema for Punishment.
 */
const PunishmentSchema: Schema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'}, // Reference to the Player model
    reasons: {type: [String], required: true}, // Array of reasons for the punishment
    give: {type: Number}, // Number of drinks the player can give to others
    take: {type: Number}, // Number of drinks the player has to take
}, {_id: false});

/**
 * Mongoose Schema for the Game.
 */
const GameSchema: Schema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        creatorId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Player', // References the Player model by ObjectId
        },
        settings: {
            type: GameSettingsSchema,
            required: true,
        },
        players: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player', // References the Player model by ObjectId
            },
        ],
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question', // References the Question model by ObjectId
            },
        ],
        cleanedQuestions: [
            {
                type: new Schema({
                    _id: String,
                    type: String,
                    question: String,
                    options: [String],
                    goodOrBad: String,
                    correctOptionIndex: {type: Number}, // Only for multiple-choice questions
                    finalRanking: [String], // Only for ranking questions
                }, {_id: false}),
            },
        ], // Prepared questions ready for the frontend
        answers: [
            [AnswerSchema] // Array of arrays, where each array contains answers for a particular question
        ], // Nested Answer documents by question
        leaderboard: [LeaderboardSchema], // Array of leaderboard entries
        currentQuestionIndex: {type: Number, default: 0},
        timeRemaining: {type: Date, default: ''}, // Time remaining for the current question (defaults to time limit)
        state: {
            type: String,
            enum: ['lobby', 'quiz', 'waiting', 'results', 'leaderboard', 'aborted'],
            default: 'lobby',
        },
        playersAnswered: [
            {type: Schema.Types.ObjectId, ref: 'Player'}, // Array of players who answered
        ],
        isActive: {type: Boolean, default: true},
        result: {type: String, default: ''}, // Result of the game
        punishments: [[PunishmentSchema]], // Punishments applied to players during the game
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

/**
 * Export the Game model.
 */
const Game = model<IGame>('Game', GameSchema);

export default Game;
