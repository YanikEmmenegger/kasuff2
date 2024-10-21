// src/models/Question.ts

import {Schema, model, Document} from 'mongoose';
import {customAlphabet} from 'nanoid';

/**
 * Base Interface representing a generic Question.
 */
export interface IBaseQuestion extends Document {
    type: 'multiple-choice' | 'who-would-rather' | 'what-would-you-rather' | 'ranking';
    question: string;
    category: string; // e.g., "General", "Sports", etc.
}

/**
 * Mongoose Schema for the Base Question.
 */
const BaseQuestionSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'],
        },
        question: {type: String, required: true},
        category: {type: String, required: true},
    },
    {discriminatorKey: 'type', timestamps: true}
);

/**
 * Export the Base Question model.
 */
const BaseQuestion = model<IBaseQuestion>('Question', BaseQuestionSchema);

/**
 * Interface representing a Multiple Choice Question.
 */
export interface IMultipleChoiceQuestion extends IBaseQuestion {
    type: 'multiple-choice';
    options: string[]; // Array of possible answers
    correctOptionIndex: number; // Index of the correct answer in the options array
}

const MultipleChoiceQuestionSchema = new Schema<IMultipleChoiceQuestion>(
    {
        options: {type: [String], required: true},
        correctOptionIndex: {type: Number, required: true},
    },
    {_id: false}
);

const MultipleChoiceQuestion = BaseQuestion.discriminator<IMultipleChoiceQuestion>(
    'multiple-choice',
    MultipleChoiceQuestionSchema
);

/**
 * Interface representing a Who Would Rather Question.
 */
export interface IWhoWouldRatherQuestion extends IBaseQuestion {
    type: 'who-would-rather';
    option1: string; // First option
    option2: string; // Second option
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

const WhoWouldRatherQuestionSchema = new Schema<IWhoWouldRatherQuestion>(
    {
        option1: {type: String, required: true},
        option2: {type: String, required: true},
        goodOrBad: {type: String, enum: ['good', 'bad'], required: true},
    },
    {_id: false}
);

const WhoWouldRatherQuestion = BaseQuestion.discriminator<IWhoWouldRatherQuestion>(
    'who-would-rather',
    WhoWouldRatherQuestionSchema
);

/**
 * Interface representing a What Would You Rather Question.
 */
export interface IWhatWouldYouRatherQuestion extends IBaseQuestion {
    type: 'what-would-you-rather';
    option1: string; // First option
    option2: string; // Second option
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

const WhatWouldYouRatherQuestionSchema = new Schema<IWhatWouldYouRatherQuestion>(
    {
        option1: {type: String, required: true},
        option2: {type: String, required: true},
        goodOrBad: {type: String, enum: ['good', 'bad'], required: true},
    },
    {_id: false}
);

const WhatWouldYouRatherQuestion = BaseQuestion.discriminator<IWhatWouldYouRatherQuestion>(
    'what-would-you-rather',
    WhatWouldYouRatherQuestionSchema
);

/**
 * Interface representing a Ranking Question.
 */
export interface IRankingQuestion extends IBaseQuestion {
    type: 'ranking';
    categories: string[]; // Categories or items to rank
}

const RankingQuestionSchema = new Schema<IRankingQuestion>(
    {
        categories: {type: [String], required: true},
    },
    {_id: false}
);

const RankingQuestion = BaseQuestion.discriminator<IRankingQuestion>(
    'ranking',
    RankingQuestionSchema
);

/**
 * Export all specific Question models.
 */
export {
    MultipleChoiceQuestion,
    WhoWouldRatherQuestion,
    WhatWouldYouRatherQuestion,
    RankingQuestion,
};
