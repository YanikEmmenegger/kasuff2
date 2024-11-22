// src/routes/showPlayers.ts
import {Request, Response, Router} from 'express';
import Visitor from '../models/Visitor';
import Player from "../models/Player";

const router = Router();

router.get('/players', async (req: Request, res: Response) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        res.status(500).json({message: 'Error fetching visitors', error});
    }
});

export default router;
