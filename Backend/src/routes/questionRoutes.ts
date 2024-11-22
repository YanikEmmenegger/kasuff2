// src/routes/playerRoutes.ts
import {Request, Response, Router} from 'express';
import Question from "../models/Question";

const router = Router();

router.get('/questions', async (req: Request, res: Response) => {
    try {

        //get params from request
        const {type} = req.query;

        const _types = type ? type.toString().split(';') : [];

        //create query with params
        let query = {};
        if (_types.length > 0) {
            //if types are provided, find questions with those types
            query = {
                type: {$in: _types}
            };
        }


        const questions = await Question.find(query);
        res.json({
            count: questions.length,
            questions: questions
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching visitors', error});
    }
});

export default router;
