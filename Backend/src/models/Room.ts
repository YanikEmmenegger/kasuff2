// src/models/Room.ts

import {Schema, model, Document} from 'mongoose';
// Assuming you have a User model defined elsewhere
// Replace './User' with the correct path to your User model

function generateRandomCode(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}


/**
 * Interface representing the game settings for a room.
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
    code: string; // 6-character unique room code
    creatorUuid: string; // UUID of the room creator, references User.uuid
    settings: IGameSettings; // Game settings
    players: string[]; // Array of User UUIDs
    createdAt: Date; // Timestamp of room creation
}

/**
 * Generate a unique 6-character room code using nanoid.
 * The room code consists of uppercase letters and numbers.
 */
const generateRoomCode = generateRandomCode();

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
 * Mongoose Schema for the Room.
 */
const RoomSchema: Schema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            default: generateRoomCode,
        },
        creatorUuid: {
            type: String,
            required: true,
            ref: 'User', // References the User model by UUID
        },
        settings: {
            type: GameSettingsSchema,
            required: true,
        },
        players: [
            {
                type: String,
                ref: 'User', // References the User model by UUID
            },
        ],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        // Optional: Add timestamps for createdAt and updatedAt
        timestamps: true,
    }
);

/**
 * Export the Room model.
 */
const Room = model<IRoom>('Room', RoomSchema);

export default Room;
