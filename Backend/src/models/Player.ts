// src/models/Player.ts

import {Schema, model, Document} from 'mongoose';

export interface IAvatar {
    hat: string;
    face: string;
    body: string;
    pants: string;
}

export interface IPlayer extends Document {
    uuid: string;
    name: string;
    avatar?: IAvatar | null; // Optional and nullable
    socketId: string;
    points: number;
    roomId?: string; // Made optional
}

const AvatarSchema: Schema = new Schema({
    hat: {type: String, required: true},
    face: {type: String, required: true},
    body: {type: String, required: true},
    pants: {type: String, required: true},
}, {_id: false}); // Disable _id for embedded documents

const PlayerSchema: Schema = new Schema({
    uuid: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    avatar: {type: AvatarSchema, default: null}, // Allow avatar to be null
    socketId: {type: String, default: ''},
    points: {type: Number, default: 0},
    roomId: {type: String, ref: 'Room'}, // Made optional
}, {
    timestamps: true,
});

const Player = model<IPlayer>('Player', PlayerSchema);

export default Player;
