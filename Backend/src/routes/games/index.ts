// src/routes/games.ts

import express from 'express';
import {
    createGame,
    joinGame,
    leaveGame,
    startGame,
    submitAnswer,
    getGameState,
} from '../../controllers/gameController';

const router = express.Router();

/**
 * @route   POST /games
 * @desc    Create a new game
 * @access  Public
 */
router.post('/', createGame); // Apply validation middleware if implemented

/**
 * @route   POST /games/:code/join
 * @desc    Join a game
 * @access  Public
 */
router.post('/:code/join', joinGame);

/**
 * @route   POST /games/:code/leave
 * @desc    Leave a game
 * @access  Public
 */
router.post('/:code/leave', leaveGame);

/**
 * @route   POST /games/:code/start
 * @desc    Start the game
 * @access  Public
 */
router.post('/:code/start', startGame);

/**
 * @route   POST /games/:code/answer
 * @desc    Submit an answer to the current question
 * @access  Public
 */
router.post('/:code/answer', submitAnswer);

/**
 * @route   GET /games/:code/state
 * @desc    Get the current state of the game
 * @access  Public
 */
router.get('/:code/state', getGameState);

export default router;
