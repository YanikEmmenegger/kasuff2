import express from 'express';
import { createPlayer, getPlayerByUuid, updatePlayer } from '../../controllers/playerController';

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

/**
 * @route   PUT /players/:uuid
 * @desc    Update player details by UUID
 * @access  Public
 */
router.put('/:uuid', updatePlayer);

export default router;