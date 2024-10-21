// src/routes/users.ts

import express from 'express';
import { createPlayer, getPlayerByUUID } from '../../controllers/playerController';

const router = express.Router();

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', createPlayer);

/**
 * @route   GET /users/:uuid
 * @desc    Get user details by UUID
 * @access  Public
 */
router.get('/:uuid', getPlayerByUUID);

export default router;
