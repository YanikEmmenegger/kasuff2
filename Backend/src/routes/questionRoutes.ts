// src/routes/playerRoutes.ts
import {Request, Response, Router} from 'express';
import Question, {IBaseQuestion} from '../models/Question';
import {isAdmin} from "./middleware";

const router = Router();


router.get('/questions', isAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        // Get 'type' from query parameters and ensure it's a string
        const {type} = req.query;
        const _types = typeof type === 'string' ? type.split(';') : [];

        // Build the query object
        let query = {};
        if (_types.length > 0) {
            query = {type: {$in: _types}};
        }

        const questions = await Question.find(query);
        res.json({
            count: questions.length,
            questions,
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching questions', error});
    }
});

// Apply isAdmin middleware to the POST /questions route
router.post('/questions', isAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body

        // check if the request body is empty
        if (!req.body) {
            res.status(400).json({message: 'Request body is empty'});
            return;
        }
        // check if request body is question
        if (!req.body.question) {
            res.status(400).json({message: 'Request body is not a question'});
            return;
        }
        // check if request body is type IBaseQuestion
        const question: IBaseQuestion = req.body.question;

        // check if the question is empty
        if (!question) {
            res.status(400).json({message: 'Question is empty'});
            return;
        }
        // check if the question is empty
        if (!question.type) {
            res.status(400).json({message: 'Question type is empty'});
            return;
        }
        // check if the question is empty
        if (!question.question) {
            res.status(400).json({message: 'Question text is empty'});
            return;
        }

        // create question
        const newQuestion = new Question(question);
        await newQuestion.save();
        res.json({message: 'Question created successfully', question: newQuestion});


    } catch (error) {
        res.status(500).json({message: 'Error creating question', error});
    }
});

export default router;
