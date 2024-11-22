// src/routes/playerRoutes.ts
import {Request, Response, Router} from 'express';
import Player from "../models/Player";

const router = Router();

router.get('/players', async (req: Request, res: Response) => {

    try {

        //get params from request
        const {name} = req.query;

        //create query with params
        let query = {};
        if (name) {
            //if name is provided, find players with that name or contains that name
            query = {
                name: {$regex: name.toString(), $options: 'i'}
            };
        }
        //find players with query
        const players = await Player.find(query);

        res.json({
            count: players.length,
            players: players
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching visitors', error});
    }
});

export default router;
