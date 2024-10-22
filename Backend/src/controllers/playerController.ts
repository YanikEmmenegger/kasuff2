import { Request, Response } from 'express';
import Player, { IPlayer, IAvatar } from '../models/Player';


export const getPlayerByUuid = async (req: Request, res: Response): Promise<void> => {
    try {
        const { uuid } = req.params;

        if (!uuid) {
            res.status(400).json({ message: 'UUID is required.' });
            return;
        }

        const player: IPlayer | null = await Player.findOne({ uuid });

        if (!player) {
            res.status(404).json({ message: 'Player not found.' });
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
        res.status(500).json({ message: 'Internal server error.' });
    }
};
/**
 * Controller to create a new player.
 * Expects `uuid`, `name`, and optionally `avatar` in the request body.
 */
export const createPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { uuid, name, avatar } = req.body;

        // Validate required fields
        if (!uuid || !name) {
            res.status(400).json({ message: 'UUID and name are required.' });
            return;
        }

        // Check if the UUID already exists
        const existingPlayer: IPlayer | null = await Player.findOne({ uuid });
        if (existingPlayer) {
            res.status(409).json({ message: 'UUID already exists. Please use a unique UUID.' });
            return;
        }

        // If avatar is provided, validate its structure (ensure variant and color are numbers)
        let validatedAvatar: IAvatar | null = null;
        if (avatar) {
            const { hat, face, body, pants } = avatar;
            if (
                typeof hat?.variant !== 'number' || typeof hat?.color !== 'number' ||
                typeof face?.variant !== 'number' || typeof face?.color !== 'number' ||
                typeof body?.variant !== 'number' || typeof body?.color !== 'number' ||
                typeof pants?.variant !== 'number' || typeof pants?.color !== 'number'
            ) {
                res.status(400).json({
                    message: 'All avatar parts (hat, face, body, pants) must contain both a numeric variant and a numeric color.',
                });
                return;
            }
            validatedAvatar = { hat, face, body, pants };
        }

        // Create a new Player document
        const newPlayer: IPlayer = new Player({
            uuid,
            name,
            avatar: validatedAvatar,
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
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Controller to update player details by UUID.
 * Can update `name`, `avatar`, `gameCode`, `socketId`, and `points` in the request body.
 */
export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { uuid } = req.params;
        const { name, avatar, gameCode, socketId, points } = req.body;

        // Validate UUID in params
        if (!uuid) {
            res.status(400).json({ message: 'UUID is required.' });
            return;
        }

        // Find player by UUID
        const player: IPlayer | null = await Player.findOne({ uuid });

        if (!player) {
            res.status(404).json({ message: 'Player not found.' });
            return;
        }

        // Update the fields if provided in the request body
        if (name) {
            player.name = name;
        }

        // If avatar is provided, validate that variant and color are numeric indices
        if (avatar) {
            const { hat, face, body, pants } = avatar;
            if (
                typeof hat?.variant !== 'number' || typeof hat?.color !== 'number' ||
                typeof face?.variant !== 'number' || typeof face?.color !== 'number' ||
                typeof body?.variant !== 'number' || typeof body?.color !== 'number' ||
                typeof pants?.variant !== 'number' || typeof pants?.color !== 'number'
            ) {
                res.status(400).json({
                    message: 'All avatar parts (hat, face, body, pants) must contain both a numeric variant and a numeric color.',
                });
                return;
            }
            player.avatar = { hat, face, body, pants };
        }

        if (gameCode) {
            player.gameCode = gameCode;
        }

        if (socketId) {
            player.socketId = socketId;
        }

        if (typeof points === 'number') {
            player.points = points;
        }

        // Save the updated player document
        await player.save();

        // Respond with updated player details
        res.status(200).json({
            message: 'Player updated successfully.',
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
        console.error('Error updating player:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};