// src/middleware/validateQuestion.ts

import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import { body, validationResult } from 'express-validator';

export const validateCreateQuestion = [
    body('type')
        .isIn(['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'])
        .withMessage('Invalid question type.'),
    body('question').notEmpty().withMessage('Question text is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
    // Type-specific validations
    body('options')
        .if(body('type').equals('multiple-choice'))
        .isArray({ min: 2 })
        .withMessage('Multiple-choice questions require at least two options.'),
    body('correctOptionIndex')
        .if(body('type').equals('multiple-choice'))
        .isInt({ min: 0 })
        .withMessage('Correct option index must be a non-negative integer.'),
    body('option1')
        .if(body('type').isIn(['who-would-rather', 'what-would-you-rather']))
        .notEmpty()
        .withMessage('option1 is required for this question type.'),
    body('option2')
        .if(body('type').isIn(['who-would-rather', 'what-would-you-rather']))
        .notEmpty()
        .withMessage('option2 is required for this question type.'),
    body('goodOrBad')
        .if(body('type').isIn(['who-would-rather', 'what-would-you-rather']))
        .isIn(['good', 'bad'])
        .withMessage('goodOrBad must be either "good" or "bad".'),
    body('categories')
        .if(body('type').equals('ranking'))
        .isArray({ min: 2 })
        .withMessage('Ranking questions require at least two categories.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
