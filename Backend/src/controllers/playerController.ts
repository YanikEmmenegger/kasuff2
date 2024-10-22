// src/controllers/playerController.ts

import {Request, Response} from 'express';
import Player, {IPlayer, IAvatar} from '../models/Player';

/**
 * Controller to create a new player.
 * Expects `uuid`, `name`, and optionally `avatar` in the request body.
 */
export const createPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const {uuid, name, avatar} = req.body;

        // Validate required fields
        if (!uuid || !name) {
            res.status(400).json({message: 'UUID and name are required.'});
            return;
        }

        // Check if the UUID already exists
        const existingPlayer: IPlayer | null = await Player.findOne({uuid});
        if (existingPlayer) {
            res.status(409).json({message: 'UUID already exists. Please use a unique UUID.'});
            return;
        }

        // If avatar is provided, validate its structure
        let validatedAvatar: IAvatar | null = null;
        if (avatar) {
            const {hat, face, body, pants} = avatar;
            if (!hat || !face || !body || !pants) {
                res.status(400).json({message: 'All avatar fields (hat, face, body, pants) must be provided if avatar is set.'});
                return;
            }
            validatedAvatar = {hat, face, body, pants};
        }

        // Create a new Player document
        const newPlayer: IPlayer = new Player({
            uuid,
            name,
            avatar: validatedAvatar,
            // socketId is empty by default; will be updated upon Socket.IO connection
            // gameCode is undefined by default; will be set when joining a game
        });

        await newPlayer.save();

        // Respond with the new player's details
        res.status(201).json({
            message: 'Player created successfully.',
            player: {
                uuid: newPlayer.uuid,
                name: newPlayer.name,
                avatar: newPlayer.avatar,
                points: newPlayer.points,
                gameCode: newPlayer.gameCode || null,
            },
        });
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to get player details by UUID.
 */
export const getPlayerByUuid = async (req: Request, res: Response): Promise<void> => {
    try {
        const {uuid} = req.params;

        if (!uuid) {
            res.status(400).json({message: 'UUID is required.'});
            return;
        }

        const player: IPlayer | null = await Player.findOne({uuid});

        if (!player) {
            res.status(404).json({message: 'Player not found.'});
            return;
        }

        res.status(200).json({
            player: {
                uuid: player.uuid,
                name: player.name,
                avatar: player.avatar,
                points: player.points,
                gameCode: player.gameCode || null,
                socketId: player.socketId || null,
            },
        });
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};
