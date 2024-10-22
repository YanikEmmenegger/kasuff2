// src/models/Game.ts

import {Schema, model, Document} from 'mongoose';

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
 * Interface representing an answer to a question within a game.
 */
export interface IAnswer {
    userUuid: string; // References Player.uuid
    questionId: Schema.Types.ObjectId; // References Question._id
    answer: string; // User's answer
    isCorrect?: boolean; // Determined based on the question type
    pointsAwarded?: number; // Points awarded for the answer
}

/**
 * Interface representing a Game document in MongoDB.
 */
export interface IGame extends Document {
    code: string; // 6-character unique game code
    creatorUuid: string; // UUID of the game creator, references Player.uuid
    settings: IGameSettings; // Game settings
    players: string[]; // Array of Player UUIDs
    questions: Schema.Types.ObjectId[]; // Array of Question IDs
    answers: IAnswer[]; // Array of Answer documents
    currentQuestionIndex: number; // Index of the current question
    isActive: boolean; // Indicates if the game is ongoing
    createdAt: Date; // Timestamp of game creation
    updatedAt: Date; // Timestamp of last update
}

/**
 * Function to generate a random 6-character game code.
 */
function generateRandomCode(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

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
    userUuid: {type: String, required: true, ref: 'Player'},
    questionId: {type: Schema.Types.ObjectId, required: true, ref: 'Question'},
    answer: {type: String, required: true},
    isCorrect: {type: Boolean},
    pointsAwarded: {type: Number},
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
            default: generateRandomCode,
        },
        creatorUuid: {
            type: String,
            required: true,
            ref: 'Player', // References the Player model by UUID
        },
        settings: {
            type: GameSettingsSchema,
            required: true,
        },
        players: [
            {
                type: String,
                ref: 'Player', // References the Player model by UUID
            },
        ],
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question', // References the Question model by ID
            },
        ],
        answers: [AnswerSchema], // Embedded Answer documents
        currentQuestionIndex: {type: Number, default: 0},
        isActive: {type: Boolean, default: false},
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
