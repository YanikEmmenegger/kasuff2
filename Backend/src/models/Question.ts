import {Document, model, Schema} from 'mongoose';
import {QuestionType} from "./Game";

/**
 * Base Interface representing a generic Question.
 */
export interface IBaseQuestion extends Document {
    _id: Schema.Types.ObjectId;
    type: QuestionType;
    question: string;
    category: string; // e.g., "General", "Sports", etc.
}

/**
 * Interface representing a Cleaned Question (safe for frontend).
 */
export interface ICleanedQuestion {
    _id: Schema.Types.ObjectId; // Question ID
    type: QuestionType; // Question type
    question: string; // The actual question text
}

/**
 * Interface representing a Cleaned Multiple Choice Question.
 */
export interface ICleanMultipleChoiceQuestion extends ICleanedQuestion {
    options: string[]; // Array of options for multiple-choice
    correctOptionIndex: number; // Index of the correct answer
}

/**
 * Interface representing a Cleaned Who Would Rather Question.
 */
export interface ICleanWhoWouldRatherQuestion extends ICleanedQuestion {
    options: string[]; // Dynamically generated player options
    goodOrBad: 'good' | 'bad'; // The outcome type
}

/**
 * Interface representing a Cleaned What Would You Rather Question.
 */
export interface ICleanWhatWouldYouRatherQuestion extends ICleanedQuestion {
    options: string[]; // Array of choices
    goodOrBad: 'good' | 'bad'; // The outcome type
}

/**
 * Interface representing a Cleaned Ranking Question.
 */
export interface ICleanRankingQuestion extends ICleanedQuestion {
    options: string[]; // Array of player options to rank
    goodOrBad: 'good' | 'bad'; // Outcome type for ranking questions
    finalRanking: string[]; // Final ranking of players
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
 * Export the Base Question model as the default export.
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

/**
 * Mongoose Schema for Multiple Choice Question.
 */
const MultipleChoiceQuestionSchema = new Schema<IMultipleChoiceQuestion>(
    {
        options: {type: [String], required: true},
        correctOptionIndex: {type: Number, required: true},
    },
    {_id: false}
);

/**
 * Discriminator for Multiple Choice Question.
 */
const MultipleChoiceQuestion = BaseQuestion.discriminator<IMultipleChoiceQuestion>(
    'multiple-choice',
    MultipleChoiceQuestionSchema
);

/**
 * Interface representing a Who Would Rather Question.
 * Options will be filled dynamically with players.
 */
export interface IWhoWouldRatherQuestion extends IBaseQuestion {
    type: 'who-would-rather';
    options: string[]; // Array of players to choose from
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
    quantity: number; // Number of players/options to provide (default: 2)
}

/**
 * Mongoose Schema for Who Would Rather Question.
 */
const WhoWouldRatherQuestionSchema = new Schema<IWhoWouldRatherQuestion>(
    {
        options: {type: [String], required: true}, // Array of players
        goodOrBad: {type: String, enum: ['good', 'bad'], required: true},
        quantity: {type: Number, default: 2, required: true}, // Default number of options is 2
    },
    {_id: false}
);

/**
 * Discriminator for Who Would Rather Question.
 */
const WhoWouldRatherQuestion = BaseQuestion.discriminator<IWhoWouldRatherQuestion>(
    'who-would-rather',
    WhoWouldRatherQuestionSchema
);

/**
 * Interface representing a What Would You Rather Question.
 */
export interface IWhatWouldYouRatherQuestion extends IBaseQuestion {
    type: 'what-would-you-rather';
    options: string[]; // Array of choices
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

/**
 * Mongoose Schema for What Would You Rather Question.
 */
const WhatWouldYouRatherQuestionSchema = new Schema<IWhatWouldYouRatherQuestion>(
    {
        options: {type: [String], required: true}, // Array of choices
        goodOrBad: {type: String, enum: ['good', 'bad'], required: true},
    },
    {_id: false}
);

/**
 * Discriminator for What Would You Rather Question.
 */
const WhatWouldYouRatherQuestion = BaseQuestion.discriminator<IWhatWouldYouRatherQuestion>(
    'what-would-you-rather',
    WhatWouldYouRatherQuestionSchema
);

/**
 * Interface representing a Ranking Question.
 * Options will be filled dynamically with players.
 */
export interface IRankingQuestion extends IBaseQuestion {
    type: 'ranking';
    options: string[]; // Array of players to rank
    goodOrBad: 'good' | 'bad'; // Determines type of outcome for ranking questions
}

/**
 * Mongoose Schema for Ranking Question.
 */
const RankingQuestionSchema = new Schema<IRankingQuestion>(
    {
        options: {type: [String], required: true}, // Array of players
        goodOrBad: {type: String, enum: ['good', 'bad'], required: true}, // Outcome type for ranking questions
    },
    {_id: false}
);

/**
 * Discriminator for Ranking Question.
 */
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

/**
 * Union type representing any question type.
 */
export type IQuestion =
    | IMultipleChoiceQuestion
    | IWhoWouldRatherQuestion
    | IWhatWouldYouRatherQuestion
    | IRankingQuestion;

/**
 * Union type representing any cleaned question type.
 */
export type ICleanQuestion =
    | ICleanMultipleChoiceQuestion
    | ICleanWhoWouldRatherQuestion
    | ICleanWhatWouldYouRatherQuestion
    | ICleanRankingQuestion;

/**
 * Export BaseQuestion as the default export.
 */
export default BaseQuestion;
