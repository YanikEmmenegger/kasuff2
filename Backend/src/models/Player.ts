import {Document, model, Schema} from 'mongoose';

/**
 * Interface representing a Player document in MongoDB.
 */
export interface IPlayer extends Document {
    _id: Schema.Types.ObjectId; // Explicitly define the _id field as ObjectId
    name: string;
    avatar?: Record<string, any> | null; // Optional and can contain any object structure
    socketId: string;
    points: number;
    gameCode?: string; // Reference to Game.code
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Schema for the Player.
 */
const PlayerSchema: Schema = new Schema({
    name: {type: String, required: true},
    avatar: {type: Schema.Types.Mixed, default: null}, // Flexible structure, can hold any object or be null
    socketId: {type: String, default: ''},
    points: {type: Number, default: 0},
    gameCode: {type: String, ref: 'Game'}, // Reference to Game by code
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

/**
 * Export the Player model.
 */
const Player = model<IPlayer>('Player', PlayerSchema);

export default Player;
