// src/controllers/roomController.ts

import {Request, Response} from 'express';
import Room, {IRoom, IGameSettings} from '../models/Room';
import Player, {IPlayer} from '../models/Player'; // Ensure this path is correct
import {customAlphabet} from 'nanoid';

function generateRandomCode(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

// Function to generate a unique 6-character room code

/**
 * Controller to create a new room.
 * Expects the creatorUuid and settings in the request body.
 */
export const createRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const {creatorUuid, settings} = req.body;

        // Validate required fields
        if (!creatorUuid || !settings) {
            res.status(400).json({message: 'creatorUuid and settings are required.'});
            return;
        }

        // Validate game settings structure
        const {numberOfQuestions, questionTypes, timeLimit, punishmentMultiplier} = settings;

        if (
            typeof numberOfQuestions !== 'number' ||
            !Array.isArray(questionTypes) ||
            typeof timeLimit !== 'number' ||
            typeof punishmentMultiplier !== 'number'
        ) {
            res.status(400).json({message: 'Invalid game settings format.'});
            return;
        }

        // Verify that the creator exists
        const creator: IPlayer | null = await Player.findOne({uuid: creatorUuid});

        if (!creator) {
            res.status(404).json({message: 'Creator player not found.'});
            return;
        }

        // Generate a unique room code
        let roomCode: string;
        let isUnique = false;

        while (!isUnique) {
            roomCode = generateRandomCode();
            const existingRoom = await Room.findOne({code: roomCode});
            if (!existingRoom) {
                isUnique = true;
            }
        }

        // Define game settings
        const gameSettings: IGameSettings = {
            numberOfQuestions,
            questionTypes,
            timeLimit,
            punishmentMultiplier,
        };

        // Create a new room instance
        const newRoom: IRoom = new Room({
            code: roomCode!,
            creatorUuid: creatorUuid,
            settings: gameSettings,
            players: [creatorUuid], // Add creator to the players array
        });

        // Save the room to the database
        await newRoom.save();

        // Respond with the room details
        res.status(201).json({
            message: 'Room created successfully.',
            room: {
                code: newRoom.code,
                settings: newRoom.settings,
                players: newRoom.players,
                createdAt: newRoom.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to get room details by room code.
 * Expects the room code as a URL parameter.
 */
export const getRoomByCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const {code} = req.params;

        if (!code) {
            res.status(400).json({message: 'Room code is required.'});
            return;
        }

        // Find the room by code
        const room: IRoom | null = await Room.findOne({code});

        if (!room) {
            res.status(404).json({message: 'Room not found.'});
            return;
        }

        // Fetch player details based on UUIDs
        const players: IPlayer[] = await Player.find({uuid: {$in: room.players}}).select('-password -__v');

        // Prepare player information to send in response
        const playerDetails = players.map((player) => ({
            uuid: player.uuid,
            name: player.name,
            avatar: player.avatar,
            // Include other relevant fields if necessary
        }));

        // Respond with room details and player list
        res.status(200).json({
            code: room.code,
            settings: room.settings,
            players: playerDetails,
            createdAt: room.createdAt,
        });
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};
