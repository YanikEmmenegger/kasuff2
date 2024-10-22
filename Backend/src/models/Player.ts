// src/models/Player.ts

import {Schema, model, Document} from 'mongoose';

/**
 * Interface representing a player's avatar.
 */
export interface IAvatar {
    hat: string;
    face: string;
    body: string;
    pants: string;
}

/**
 * Interface representing a Player document in MongoDB.
 */
export interface IPlayer extends Document {
    uuid: string;
    name: string;
    avatar?: IAvatar | null; // Optional and nullable
    socketId: string;
    points: number;
    gameCode?: string; // Reference to Game.code
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Schema for Avatar.
 */
const AvatarSchema: Schema = new Schema({
    hat: {type: String, required: true},
    face: {type: String, required: true},
    body: {type: String, required: true},
    pants: {type: String, required: true},
}, {_id: false}); // Disable _id for embedded documents

/**
 * Mongoose Schema for the Player.
 */
const PlayerSchema: Schema = new Schema({
    uuid: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    avatar: {type: AvatarSchema, default: null}, // Allow avatar to be null
    socketId: {type: String, default: ''},
    points: {type: Number, default: 0},
    gameCode: {type: String, ref: 'Game'}, // Reference to Game by code
}, {
    timestamps: true,
});

/**
 * Export the Player model.
 */
const Player = model<IPlayer>('Player', PlayerSchema);

export default Player;
