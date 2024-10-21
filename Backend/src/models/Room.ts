// src/models/Room.ts

import {Schema, model, Document} from 'mongoose';
import {customAlphabet} from 'nanoid';

/**
 * Interface representing the Game Settings.
 */
export interface IGameSettings {
    numberOfQuestions: number;
    questionTypes: ('multiple-choice' | 'who-would-rather' | 'what-would-you-rather' | 'ranking')[];
    timeLimit: number; // in seconds
    punishmentMultiplier: number; // e.g., 1 for normal, 2 for double
}

/**
 * Interface representing a Room document in MongoDB.
 */
export interface IRoom extends Document {
    code: string;                // 6-character unique room code
    creatorUuid: string;         // UUID of the room creator
    settings: IGameSettings;     // Game settings
    players: string[];           // Array of player UUIDs
    createdAt: Date;             // Timestamp of room creation
}

/**
 * Generate a unique 6-character room code using nanoid.
 */
const generateRoomCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

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
            },
        ],
        required: true,
        default: ['multiple-choice'],
    },
    timeLimit: {type: Number, required: true, default: 30}, // default 30 seconds
    punishmentMultiplier: {type: Number, required: true, default: 1}, // default no multiplier
});

/**
 * Mongoose Schema for the Room.
 */
const RoomSchema: Schema = new Schema({
    code: {type: String, required: true, unique: true, default: generateRoomCode},
    creatorUuid: {type: String, required: true},
    settings: {type: GameSettingsSchema, required: true},
    players: [{type: String, ref: 'Player'}],
    createdAt: {type: Date, default: Date.now},
});

/**
 * Export the Room model.
 */
const Room = model<IRoom>('Room', RoomSchema);

export default Room;
