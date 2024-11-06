import {Document, model, Schema} from 'mongoose';
import {ICleanQuestion} from './Question';

/**
 * Centralized Constants for Enums
 */
export const QUESTION_TYPES = [
    'multiple-choice',
    'who-would-rather',
    'what-would-you-rather',
    'ranking',
] as const;

export const MINI_GAME_TYPES = [
    'hide-and-seek',
    'memory'
] as const;

export const GAME_STATES = [
    'lobby',
    'round',
    'waiting',
    'perks',
    'results',
    'punishment',
    'leaderboard',
    'aborted',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type MiniGameType = (typeof MINI_GAME_TYPES)[number];
export type GameState = (typeof GAME_STATES)[number];
export type GameModeType = QuestionType | MiniGameType;

/**
 * Interface for Game Settings.
 */
export interface IGameSettings {
    numberOfRounds: number;
    gameModes: GameModeType[]; // Updated to include both types
    timeLimit: number;
    punishmentMultiplier: number;
}

/**
 * Interface for Mini Game.
 */
export interface IMiniGame {
    type: MiniGameType;
}

export interface IMemoryGame extends IMiniGame {
    type: 'memory';
    pairs: String[];
}

export type MiniGame = IMemoryGame;

/**
 * Interface for Rounds that can either be a question or a mini game.
 */
export interface IRound {
    type: 'mini-game' | 'question';
    data?: IMiniGame | ICleanQuestion;
}

/**
 * Interface for a player's punishment.
 */
export interface IPunishment {
    playerId: Schema.Types.ObjectId;
    reasons: string[];
    give?: number;
    take?: number;
}

/**
 * Interface for an answer in a game.
 */
export interface IAnswer {
    playerId: Schema.Types.ObjectId;
    questionId?: Schema.Types.ObjectId;
    answer: string | string[] | number;
    answeredAt?: Date;
    isCorrect?: boolean;
    pointsAwarded?: number;
}

/**
 * Interface for a leaderboard entry.
 */
export interface ILeaderboardEntry {
    playerId: Schema.Types.ObjectId;
    totalPoints: number;
}

/**
 * Interface for Game document in MongoDB.
 */
export interface IGame extends Document {
    code: string;
    creatorId: Schema.Types.ObjectId;
    settings: IGameSettings;
    players: Schema.Types.ObjectId[];
    questions: Schema.Types.ObjectId[];
    rounds: IRound[];
    answers: IAnswer[][];
    leaderboard: ILeaderboardEntry[];
    currentRoundIndex: number;
    state: GameState;
    timeRemaining: Date;
    playersAnswered: Schema.Types.ObjectId[];
    isActive: boolean;
    punishments: IPunishment[][];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Helper function to generate a unique game code.
 */
export const generateUniqueGameCode = async (): Promise<string> => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generateCode = (length: number): string =>
        Array.from({length}, () => characters[Math.floor(Math.random() * characters.length)]).join('');

    let attempts = 0;
    let codeLength = 4;

    while (true) {
        const gameCode = generateCode(codeLength);
        if (!(await Game.findOne({code: gameCode}))) return gameCode;

        attempts++;
        if (attempts === 10) {
            codeLength = codeLength === 4 ? 6 : 10;
            attempts = 0;
        }
    }
};

/**
 * Mongoose Schemas for subdocuments.
 */
const GameSettingsSchema = new Schema({
    numberOfRounds: {type: Number, required: true, default: 10},
    gameModes: {
        type: [String],
        enum: [...QUESTION_TYPES, ...MINI_GAME_TYPES], // Updated to include both enums
        required: true,
    },
    timeLimit: {type: Number, required: true, default: 30},
    punishmentMultiplier: {type: Number, required: true, default: 1},
});

const AnswerSchema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'},
    questionId: {type: Schema.Types.ObjectId, ref: 'Question'},
    answer: {type: Schema.Types.Mixed, required: true},
    isCorrect: Boolean,
    pointsAwarded: Number,
    answeredAt: {type: Date, default: Date.now},
}, {_id: false});

const LeaderboardSchema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'},
    totalPoints: {type: Number, required: true},
}, {_id: false});

const PunishmentSchema = new Schema({
    playerId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'},
    reasons: {type: [String], required: true},
    give: Number,
    take: Number,
}, {_id: false});

/**
 * Schema for a single Round.
 */
const RoundSchema = new Schema({
    type: {
        type: String,
        enum: ["mini-game", "question"], // Updated to include both enums
        required: true,
    },
    data: {
        type: Schema.Types.Mixed, // Can be IMiniGame or ICleanQuestion
    },
}, {_id: false});

/**
 * Main Game Schema.
 */
const GameSchema = new Schema({
    code: {type: String, required: true, unique: true},
    creatorId: {type: Schema.Types.ObjectId, required: true, ref: 'Player'},
    settings: {type: GameSettingsSchema, required: true},
    players: [{type: Schema.Types.ObjectId, ref: 'Player'}],
    questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],
    rounds: [RoundSchema], // Added RoundSchema here
    answers: [[AnswerSchema]],
    leaderboard: [LeaderboardSchema],
    currentRoundIndex: {type: Number, default: 0},
    timeRemaining: {type: Date},
    state: {
        type: String,
        enum: GAME_STATES,
        default: 'lobby',
    },
    playersAnswered: [{type: Schema.Types.ObjectId, ref: 'Player'}],
    isActive: {type: Boolean, default: true},
    punishments: [[PunishmentSchema]],
}, {timestamps: true});

/**
 * Export the Game model.
 */
const Game = model<IGame>('Game', GameSchema);
export default Game;
