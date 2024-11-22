// src/routes/playerRoutes.ts
import {Request, Response, Router} from 'express';
import Game from "../models/Game";

const router = Router();

router.get('/games', async (req: Request, res: Response) => {
    try {

        //get params from request
        const {code, players} = req.query;
        const _players = players ? players.toString().split(';') : [];

        //create query with params
        let query = {};
        if (code) {
            //if code is provided, find games with that code or contains that code
            query = {
                code: code
            };
        }
        if (_players.length > 0) {
            //if players are provided, find games with those players
            query = {
                ...query,
                players: {$all: players}
            };
        }


        const games = await Game.find(query).populate('players');

        res.json({
            count: games.length,
            games: games
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching visitors', error});
    }
});

export default router;
