import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing an AvatarPart (for each part of the avatar).
 */
export interface IAvatarPart {
    variant: number;
    color: number;
}

/**
 * Interface representing a player's avatar.
 */
export interface IAvatar {
    hat: IAvatarPart;
    face: IAvatarPart;
    body: IAvatarPart;
    pants: IAvatarPart;
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
 * Mongoose Schema for AvatarPart.
 */
const AvatarPartSchema: Schema = new Schema({
    variant: { type: Number, required: true }, // Store as number (index)
    color: { type: Number, required: true }, // Store as number (index)
}, { _id: false }); // Disable _id for embedded documents

/**
 * Mongoose Schema for Avatar.
 */
const AvatarSchema: Schema = new Schema({
    hat: { type: AvatarPartSchema, required: true },
    face: { type: AvatarPartSchema, required: true },
    body: { type: AvatarPartSchema, required: true },
    pants: { type: AvatarPartSchema, required: true },
}, { _id: false }); // Disable _id for embedded documents

/**
 * Mongoose Schema for the Player.
 */
const PlayerSchema: Schema = new Schema({
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: AvatarSchema, default: null }, // Allow avatar to be null
    socketId: { type: String, default: '' },
    points: { type: Number, default: 0 },
    gameCode: { type: String, ref: 'Game' }, // Reference to Game by code
}, {
    timestamps: true,
});

/**
 * Export the Player model.
 */
const Player = model<IPlayer>('Player', PlayerSchema);

export default Player;