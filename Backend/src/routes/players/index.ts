// src/routes/players.ts

import express from 'express';
import { createPlayer, getPlayerByUuid } from '../../controllers/playerController';

const router = express.Router();

/**
 * @route   POST /players
 * @desc    Create a new player
 * @access  Public
 */
router.post('/', createPlayer);

/**
 * @route   GET /players/:uuid
 * @desc    Get player details by UUID
 * @access  Public
 */
router.get('/:uuid', getPlayerByUuid);

export default router;
