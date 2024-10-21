// src/routes/rooms/index.ts

import express from 'express';
import {createRoom, getRoomByCode} from '../../controllers/roomController';

const router = express.Router();

/**
 * @route   POST /rooms
 * @desc    Create a new room
 * @access  Public (No authentication)
 */
router.post('/', createRoom);

/**
 * @route   GET /rooms/:code
 * @desc    Get room details by room code
 * @access  Public (No authentication)
 */
router.get('/:code', getRoomByCode);

export default router;
