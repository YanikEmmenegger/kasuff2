// src/models/Question.ts

import {Schema, model, Document} from 'mongoose';

/**
 * Base Interface representing a generic Question.
 */
interface IBaseQuestion {
    type: 'multiple-choice' | 'who-would-rather' | 'what-would-you-rather' | 'ranking';
    question: string;
    category: string; // e.g., "General", "Sports", etc.
}

/**
 * Interface representing a Multiple Choice Question.
 */
interface IMultipleChoiceQuestion extends IBaseQuestion {
    type: 'multiple-choice';
    options: string[]; // Array of possible answers
    correctOptionIndex: number; // Index of the correct answer in the options array
}

/**
 * Interface representing a Who Would Rather Question.
 */
interface IWhoWouldRatherQuestion extends IBaseQuestion {
    type: 'who-would-rather';
    option1: string; // First option
    option2: string; // Second option
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

/**
 * Interface representing a What Would You Rather Question.
 */
interface IWhatWouldYouRatherQuestion extends IBaseQuestion {
    type: 'what-would-you-rather';
    option1: string; // First option
    option2: string; // Second option
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

/**
 * Interface representing a Ranking Question.
 */
interface IRankingQuestion extends IBaseQuestion {
    type: 'ranking';
    categories: string[]; // Categories or items to rank
}

/**
 * Union Type for All Question Types.
 */
export type IQuestion =
    | IMultipleChoiceQuestion
    | IWhoWouldRatherQuestion
    | IWhatWouldYouRatherQuestion
    | IRankingQuestion;

/**
 * Interface representing a Question document in MongoDB.
 */
export interface IQuestionDocument extends Document, IBaseQuestion {
}

/**
 * Mongoose Schema for the Question.
 */
const QuestionSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'],
    },
    question: {type: String, required: true},
    category: {type: String, required: true},
    // Fields for Multiple Choice Questions
    options: {
        type: [String],
        required: function (this: IQuestionDocument) {
            return this.type === 'multiple-choice';
        },
    },
    correctOptionIndex: {
        type: Number,
        required: function (this: IQuestionDocument) {
            return this.type === 'multiple-choice';
        },
    },
    // Fields for Who Would Rather and What Would You Rather Questions
    option1: {
        type: String,
        required: function (this: IQuestionDocument) {
            return this.type === 'who-would-rather' || this.type === 'what-would-you-rather';
        },
    },
    option2: {
        type: String,
        required: function (this: IQuestionDocument) {
            return this.type === 'who-would-rather' || this.type === 'what-would-you-rather';
        },
    },
    goodOrBad: {
        type: String,
        enum: ['good', 'bad'],
        required: function (this: IQuestionDocument) {
            return this.type === 'who-would-rather' || this.type === 'what-would-you-rather';
        },
    },
    // Fields for Ranking Questions
    categories: {
        type: [String],
        required: function (this: IQuestionDocument) {
            return this.type === 'ranking';
        },
    },
});

/**
 * Export the Question model.
 */
const Question = model<IQuestionDocument>('Question', QuestionSchema);

export default Question;
