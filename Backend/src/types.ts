// src/types.ts

import {
    IMultipleChoiceQuestion,
    IWhoWouldRatherQuestion,
    IWhatWouldYouRatherQuestion,
    IRankingQuestion,
} from './models/Question';

/**
 * Union type representing any question type.
 */
export type IQuestion =
    | IMultipleChoiceQuestion
    | IWhoWouldRatherQuestion
    | IWhatWouldYouRatherQuestion
    | IRankingQuestion;
