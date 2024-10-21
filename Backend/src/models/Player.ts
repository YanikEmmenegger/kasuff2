// src/models/Player.ts

import {Schema, model, Document} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

/**
 * Interface representing a Player document in MongoDB.
 */
export interface IPlayer extends Document {
    uuid: string;       // Persistent unique identifier for the player
    socketId: string;   // Unique identifier for the player's socket connection
    name: string;       // Player's display name
    avatar: IAvatar;    // Player's avatar configuration
    points: number;     // Player's current points
    roomId: string;     // ID of the room the player is in
}

/**
 * Interface representing the Avatar structure.
 */
export interface IAvatar {
    hat: string;
    face: string;
    body: string;
    pants: string;
}

/**
 * Mongoose Schema for the Avatar.
 */
const AvatarSchema: Schema = new Schema({
    hat: {type: String, required: true},
    face: {type: String, required: true},
    body: {type: String, required: true},
    pants: {type: String, required: true},
});

/**
 * Mongoose Schema for the Player.
 */
const PlayerSchema: Schema = new Schema({
    uuid: {type: String, required: true, unique: true, default: uuidv4},
    socketId: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    avatar: {type: AvatarSchema, required: true},
    points: {type: Number, default: 0},
    roomId: {type: String, required: true},
});

/**
 * Export the Player model.
 */
const Player = model<IPlayer>('Player', PlayerSchema);

export default Player;
