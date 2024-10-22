// src/controllers/questionController.ts

import {Request, Response} from 'express';
import Question, {
    IMultipleChoiceQuestion,
    IWhoWouldRatherQuestion,
    IWhatWouldYouRatherQuestion,
    IRankingQuestion,
} from '../models/Question';
import {IQuestion} from '../types';
import {Types} from 'mongoose';

/**
 * Controller to create a new question.
 * Expects `type`, `question`, `category`, and type-specific fields in the request body.
 */
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const {type, question, category, ...typeSpecificFields} = req.body;

        // Validate required fields
        if (!type || !question || !category) {
            res.status(400).json({message: 'Type, question, and category are required.'});
            return;
        }

        // Validate question type
        const validTypes = ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'];
        if (!validTypes.includes(type)) {
            res.status(400).json({message: `Invalid question type. Valid types are: ${validTypes.join(', ')}`});
            return;
        }

        // Create the base question
        const baseQuestion = new Question({
            type,
            question,
            category,
        });

        let savedQuestion: IQuestion;

        // Add type-specific fields using discriminators
        switch (type) {
            case 'multiple-choice':
                const {options, correctOptionIndex} = typeSpecificFields;
                if (!options || !Array.isArray(options) || options.length < 2) {
                    res.status(400).json({message: 'Multiple-choice questions require at least two options.'});
                    return;
                }
                if (
                    correctOptionIndex === undefined ||
                    typeof correctOptionIndex !== 'number' ||
                    correctOptionIndex < 0 ||
                    correctOptionIndex >= options.length
                ) {
                    res.status(400).json({message: 'Valid correctOptionIndex is required.'});
                    return;
                }
                const mcQuestion = baseQuestion as IMultipleChoiceQuestion;
                mcQuestion.options = options;
                mcQuestion.correctOptionIndex = correctOptionIndex;
                savedQuestion = await mcQuestion.save();
                break;

            case 'who-would-rather':
            case 'what-would-you-rather':
                const {option1, option2, goodOrBad} = typeSpecificFields;
                if (!option1 || !option2 || !goodOrBad) {
                    res.status(400).json({message: 'These question types require option1, option2, and goodOrBad fields.'});
                    return;
                }
                if (!['good', 'bad'].includes(goodOrBad)) {
                    res.status(400).json({message: 'goodOrBad must be either "good" or "bad".'});
                    return;
                }
                const wrQuestion =
                    type === 'who-would-rather'
                        ? (baseQuestion as IWhoWouldRatherQuestion)
                        : (baseQuestion as IWhatWouldYouRatherQuestion);
                wrQuestion.option1 = option1;
                wrQuestion.option2 = option2;
                wrQuestion.goodOrBad = goodOrBad;
                savedQuestion = await wrQuestion.save();
                break;

            case 'ranking':
                const {categories} = typeSpecificFields;
                if (!categories || !Array.isArray(categories) || categories.length < 2) {
                    res.status(400).json({message: 'Ranking questions require at least two categories.'});
                    return;
                }
                const rankingQuestion = baseQuestion as IRankingQuestion;
                rankingQuestion.categories = categories;
                savedQuestion = await rankingQuestion.save();
                break;

            default:
                res.status(400).json({message: 'Unsupported question type.'});
                return;
        }

        res.status(201).json({
            message: 'Question created successfully.',
            question: savedQuestion,
        });

        // Emit event to notify creation (optional)
        // io.emit('questionCreated', { questionId: savedQuestion._id, type: savedQuestion.type });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to retrieve all questions.
 * Can accept query parameters to filter by type or category.
 */
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const {type, category} = req.query;

        // Build the query object based on query parameters
        const query: any = {};
        if (type) {
            query.type = type;
        }
        if (category) {
            query.category = category;
        }

        const questions = await Question.find(query);

        res.status(200).json({
            count: questions.length,
            questions,
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to retrieve a single question by its ID.
 */
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;

        if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({message: 'Invalid question ID.'});
            return;
        }

        const question = await Question.findById(id);

        if (!question) {
            res.status(404).json({message: 'Question not found.'});
            return;
        }

        res.status(200).json({question});
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to update an existing question by its ID.
 * Allows updating of type-specific fields.
 */
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const updateData = req.body;

        if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({message: 'Invalid question ID.'});
            return;
        }

        const question = await Question.findById(id);
        if (!question) {
            res.status(404).json({message: 'Question not found.'});
            return;
        }

        // Update base fields
        if (updateData.question) question.question = updateData.question;
        if (updateData.category) question.category = updateData.category;

        // Update type-specific fields
        switch (question.type) {
            case 'multiple-choice':
                const mcUpdate = updateData as Partial<IMultipleChoiceQuestion>;
                if (mcUpdate.options) {
                    if (!Array.isArray(mcUpdate.options) || mcUpdate.options.length < 2) {
                        res.status(400).json({message: 'Multiple-choice questions require at least two options.'});
                        return;
                    }
                    (question as IMultipleChoiceQuestion).options = mcUpdate.options;
                }
                if (mcUpdate.correctOptionIndex !== undefined) {
                    const mcQuestion = question as IMultipleChoiceQuestion;
                    if (
                        typeof mcUpdate.correctOptionIndex !== 'number' ||
                        mcUpdate.correctOptionIndex < 0 ||
                        mcUpdate.correctOptionIndex >= mcQuestion.options.length
                    ) {
                        res.status(400).json({message: 'Invalid correctOptionIndex.'});
                        return;
                    }
                    mcQuestion.correctOptionIndex = mcUpdate.correctOptionIndex;
                }
                break;

            case 'who-would-rather':
            case 'what-would-you-rather':
                const wrUpdate =
                    question.type === 'who-would-rather'
                        ? (updateData as Partial<IWhoWouldRatherQuestion>)
                        : (updateData as Partial<IWhatWouldYouRatherQuestion>);
                if (wrUpdate.option1) (question as IWhoWouldRatherQuestion | IWhatWouldYouRatherQuestion).option1 = wrUpdate.option1;
                if (wrUpdate.option2) (question as IWhoWouldRatherQuestion | IWhatWouldYouRatherQuestion).option2 = wrUpdate.option2;
                if (wrUpdate.goodOrBad) {
                    if (!['good', 'bad'].includes(wrUpdate.goodOrBad)) {
                        res.status(400).json({message: 'goodOrBad must be either "good" or "bad".'});
                        return;
                    }
                    (question as IWhoWouldRatherQuestion | IWhatWouldYouRatherQuestion).goodOrBad = wrUpdate.goodOrBad;
                }
                break;

            case 'ranking':
                const rankUpdate = updateData as Partial<IRankingQuestion>;
                if (rankUpdate.categories) {
                    if (!Array.isArray(rankUpdate.categories) || rankUpdate.categories.length < 2) {
                        res.status(400).json({message: 'Ranking questions require at least two categories.'});
                        return;
                    }
                    (question as IRankingQuestion).categories = rankUpdate.categories;
                }
                break;

            default:
                res.status(400).json({message: 'Unsupported question type.'});
                return;
        }

        await question.save();

        res.status(200).json({
            message: 'Question updated successfully.',
            question,
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};

/**
 * Controller to delete a question by its ID.
 */
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;

        if (!Types.ObjectId.isValid(id)) {
            res.status(400).json({message: 'Invalid question ID.'});
            return;
        }

        const question = await Question.findById(id);
        if (!question) {
            res.status(404).json({message: 'Question not found.'});
            return;
        }

        //await question.remove();

        res.status(200).json({message: 'Question deleted successfully.'});
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};
