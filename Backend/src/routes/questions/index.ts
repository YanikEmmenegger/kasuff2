// src/routes/questions.ts

import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
} from '../../controllers/questionController';
import {validateCreateQuestion} from '../../middleware/validateQuestions'; // Validation middleware

const router = express.Router();

/**
 * @route   POST /questions
 * @desc    Create a new question
 * @access  Public
 */
router.post('/', validateCreateQuestion, createQuestion);

/**
 * @route   GET /questions
 * @desc    Retrieve all questions or filter them
 * @access  Public
 */
router.get('/', getQuestions);

/**
 * @route   GET /questions/:id
 * @desc    Retrieve a single question by ID
 * @access  Public
 */
router.get('/:id', getQuestionById);

/**
 * @route   PUT /questions/:id
 * @desc    Update a question by ID
 * @access  Public
 */
router.put('/:id', updateQuestion);

/**
 * @route   DELETE /questions/:id
 * @desc    Delete a question by ID
 * @access  Public
 */
router.delete('/:id', deleteQuestion);

export default router;
