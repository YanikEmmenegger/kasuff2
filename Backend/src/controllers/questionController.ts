import {Types} from 'mongoose';
import {OperationResult} from "../types";
import Question, {
    ICleanMultipleChoiceQuestion,
    ICleanQuestion,
    ICleanRankingQuestion,
    ICleanSpyQuestion,
    ICleanWhatWouldYouRatherQuestion,
    ICleanWhoWouldRatherQuestion,
    IMultipleChoiceQuestion,
    IQuestion,
    IRankingQuestion,
    ISpyQuestion,
    IWhatWouldYouRatherQuestion,
    IWhoWouldRatherQuestion
} from "../models/Question";
import {shuffleArray} from "../utils/questionUtils";
import {IPlayer} from "../models/Player";

/**
 * Create a new question.
 */
export const createQuestion = async (questionData: any): Promise<OperationResult<IQuestion>> => {
    try {
        const {type, question, category, ...typeSpecificFields} = questionData;

        // Validate required fields
        if (!type || !question || !category) {
            return {success: false, error: 'Type, question, and category are required.'};
        }

        // Validate question type
        const validTypes = ['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking'];
        if (!validTypes.includes(type)) {
            return {success: false, error: `Invalid question type. Valid types are: ${validTypes.join(', ')}`};
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
                    return {success: false, error: 'Multiple-choice questions require at least two options.'};
                }
                if (
                    correctOptionIndex === undefined ||
                    typeof correctOptionIndex !== 'number' ||
                    correctOptionIndex < 0 ||
                    correctOptionIndex >= options.length
                ) {
                    return {success: false, error: 'Valid correctOptionIndex is required.'};
                }
                const mcQuestion = baseQuestion as IMultipleChoiceQuestion;
                mcQuestion.options = options;
                mcQuestion.correctOptionIndex = correctOptionIndex;
                savedQuestion = await mcQuestion.save();
                break;

            case 'who-would-rather':
                const {goodOrBad, quantity} = typeSpecificFields;
                if (!goodOrBad || !['good', 'bad'].includes(goodOrBad)) {
                    return {success: false, error: 'goodOrBad must be either "good" or "bad".'};
                }
                if (quantity === undefined || typeof quantity !== 'number' || quantity < 2) {
                    return {success: false, error: 'Quantity must be at least 2.'};
                }
                const whoWouldRatherQuestion = baseQuestion as IWhoWouldRatherQuestion;
                whoWouldRatherQuestion.options = [];
                whoWouldRatherQuestion.goodOrBad = goodOrBad;
                whoWouldRatherQuestion.quantity = quantity;
                savedQuestion = await whoWouldRatherQuestion.save();
                break;

            case 'what-would-you-rather':
                const {options: wrOptions} = typeSpecificFields;
                if (!wrOptions || !Array.isArray(wrOptions) || wrOptions.length < 2) {
                    return {success: false, error: 'What-would-you-rather questions require at least two options.'};
                }
                const whatWouldYouRatherQuestion = baseQuestion as IWhatWouldYouRatherQuestion;
                whatWouldYouRatherQuestion.options = wrOptions;
                savedQuestion = await whatWouldYouRatherQuestion.save();
                break;

            case 'ranking':
                const {options: rankOptions} = typeSpecificFields;
                if (!rankOptions || !Array.isArray(rankOptions) || rankOptions.length < 2) {
                    return {success: false, error: 'Ranking questions require at least two options.'};
                }
                const rankingQuestion = baseQuestion as IRankingQuestion;
                rankingQuestion.options = rankOptions;
                savedQuestion = await rankingQuestion.save();
                break;

            default:
                return {success: false, error: 'Unsupported question type.'};
        }

        return {success: true, data: savedQuestion};
    } catch (error) {
        console.error('Error creating question:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Retrieve all questions with optional filtering by type or category.
 */
export const getQuestions = async (filters: {
    types?: string[];
    categories?: string[];
    limit?: number;
}): Promise<OperationResult<IQuestion[]>> => {
    try {
        const {types, categories, limit} = filters;

        // Convert limit to a number and set a default value if not provided
        const questionLimit = limit ? limit : 10;

        // Build the query object based on provided types and categories
        const query: any = {};
        if (types && types.length > 0) {
            query.type = {$in: types};
        }
        if (categories && categories.length > 0) {
            query.category = {$in: categories};
        }

        // Fetch random questions based on the query and limit
        const questions = await Question.aggregate([
            {$match: query},
            {$sample: {size: questionLimit}}, // Randomize the questions
        ]);

        return {success: true, data: questions};
    } catch (error) {
        console.error('Error fetching questions:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Retrieve a single question by its ID.
 */
export const getQuestionById = async (id: string): Promise<OperationResult<IQuestion>> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            return {success: false, error: 'Invalid question ID.'};
        }

        // Use `.lean()` to return a plain object instead of a Mongoose document
        const question = await Question.findById(id).lean<IQuestion>();

        if (!question) {
            return {success: false, error: 'Question not found.'};
        }

        return {success: true, data: question};
    } catch (error) {
        console.error('Error fetching question:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

export const prepareQuestions = async (
    question: IQuestion,
    players: IPlayer[] // Now accepts an array of whole player objects
): Promise<OperationResult<ICleanQuestion>> => {
    try {
        switch (question.type) {
            case 'spy':
                const spyQuestion = question as ISpyQuestion;
                const randomSpy = players[Math.floor(Math.random() * players.length)];
                const startPlayer = players[Math.floor(Math.random() * players.length)];
                const secret = spyQuestion.options[Math.floor(Math.random() * spyQuestion.options.length)];

                const cleanSpyQuestion: ICleanSpyQuestion = {
                    question: spyQuestion.question,
                    _id: spyQuestion._id,
                    spy: randomSpy._id.toString(),
                    type: 'spy',
                    topic: spyQuestion.topic,
                    secret: secret,
                    starter: startPlayer.name.toString()
                }

                return {
                    success: true,
                    data: cleanSpyQuestion
                };

            case 'multiple-choice':
                const multipleChoiceQuestion = question as IMultipleChoiceQuestion;

                if (multipleChoiceQuestion.correctOptionIndex === undefined) {
                    return {success: false, error: 'Missing correctOptionIndex in multiple-choice question'};
                }

                return {
                    success: true,
                    data: {
                        _id: question._id,
                        type: 'multiple-choice',
                        question: question.question,
                        options: multipleChoiceQuestion.options,
                        correctOptionIndex: 100000 // placeholder value
                    } as ICleanMultipleChoiceQuestion
                };

            case 'who-would-rather':
                const randomPlayers = players
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 2); // Always select 2 players

                return {
                    success: true,
                    data: {
                        _id: question._id,
                        type: 'who-would-rather',
                        question: question.question,
                        options: randomPlayers.map(p => p._id.toString()),
                        goodOrBad: (question as IWhoWouldRatherQuestion).goodOrBad
                    } as ICleanWhoWouldRatherQuestion
                };

            case 'what-would-you-rather':
                return {
                    success: true,
                    data: {
                        _id: question._id,
                        type: 'what-would-you-rather',
                        question: question.question,
                        options: (question as IWhatWouldYouRatherQuestion).options,
                        goodOrBad: (question as IWhatWouldYouRatherQuestion).goodOrBad
                    } as ICleanWhatWouldYouRatherQuestion
                };

            case 'ranking':
                const shuffledPlayers = shuffleArray(players.map(p => p.id));

                return {
                    success: true,
                    data: {
                        _id: question._id,
                        type: 'ranking',
                        question: question.question,
                        options: shuffledPlayers,
                        goodOrBad: (question as IRankingQuestion).goodOrBad,
                        finalRanking: [] // Placeholder or default value for final ranking
                    } as ICleanRankingQuestion
                };

            default:
                return {success: false, error: 'Invalid question type'};
        }
    } catch (error) {
        return {success: false, error: 'Error preparing question'};
    }
};
