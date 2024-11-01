// Represents the result of an operation

import {AvatarOptions} from "./components/avatar/types/avatarType.ts";

export type OperationResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};



// Represents a player
export interface Player {
    _id: string; // Player's MongoDB ObjectId as a string
    name: string;
    avatar?: AvatarOptions; // Avatar is optional and nullable
    socketId: string;
    points: number;
    gameCode?: string; // Reference to the game code if the player is in a game
    createdAt: string; // Date as a string
    updatedAt: string; // Date as a string
}

// Enum for Game State in the frontend
export type GameState = 'lobby' | 'quiz' | 'waiting' | 'results' | 'leaderboard' | 'aborted';

// Interface representing the game settings in the frontend
export interface GameSettings {
    numberOfQuestions: number;
    gameModes: ('multiple-choice' | 'who-would-rather' | 'what-would-you-rather' | 'ranking' | 'hide-and-seek' | 'spy' | 'memory')[];
    timeLimit: number; // in seconds
    punishmentMultiplier: number; // e.g., 1 for normal, 2 for double
}

// Interface representing an answer to a question within a game in the frontend
export interface Answer {
    playerId: string; // References Player._id
    questionId: string; // References Question._id
    answer: string | string[] | number; // User's answer
    answeredAt?: Date; // Timestamp of the answer
    isCorrect?: boolean; // Determined based on the question type
    pointsAwarded?: number; // Points awarded for the answer
}

// Interface representing a leaderboard entry in the frontend
export interface LeaderboardEntry {
    playerId: string; // Player ID as a string (from ObjectId)
    totalPoints: number; // Total points accumulated by the player
}

export interface Punishment {
    playerId: string; // References Player._id
    reasons: string[]; // Reasons for the punishment (e.g., "Didn't answer", "Answered wrong")
    give?: number; // Drinks the player can give to others
    take?: number; // Drinks the player has to take
}

// Interface representing the Game document in the frontend
export interface Game {
    _id: string; // Explicitly define the _id field as string (from ObjectId)
    code: string; // 6-character unique game code
    creatorId: string; // Creator's Player ID as a string
    settings: GameSettings; // Game settings
    players: Player[]; // Array of Player objects
    questions: string[]; // Array of Question IDs as strings
    answers: Answer[][]; // Array of arrays of Answer objects (grouped by question)
    leaderboard: LeaderboardEntry[]; // Array of leaderboard entries
    currentQuestionIndex: number; // Index of the current question
    cleanedQuestions: Question[]; // Cleaned questions (prepared when the game starts)
    state: GameState; // Current state of the game
    timeRemaining: Date; // Time remaining for the current question
    playersAnswered: string[]; // Array of Player IDs who have answered the current question
    isActive: boolean; // Indicates if the game is ongoing
    punishments: Punishment[][]; // Punishments applied to players during the game
    createdAt: string; // Timestamp of game creation as a string
    updatedAt: string; // Timestamp of the last update as a string
}

// Represents the different types of questions
export type Question =
    | MultipleChoiceQuestion
    | WhoWouldRatherQuestion
    | WhatWouldYouRatherQuestion
    | RankingQuestion;

// Represents a base question
export interface BaseQuestion {
    _id: string; // Question ID
    type: string; // Question type ('multiple-choice', 'who-would-rather', etc.)
    question: string; // The actual question text
    correctOptionIndex?: number; // Index of the correct answer in the options array (for multiple-choice)
}

// Represents a multiple-choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple-choice';
    options: string[]; // Array of possible answers
}

// Represents a "who would rather" question
export interface WhoWouldRatherQuestion extends BaseQuestion {
    type: 'who-would-rather';
    options: string[]; // Array of possible answers
    goodOrBad: 'good' | 'bad'; // Determines the type of punishment
}

// Represents a "what would you rather" question
export interface WhatWouldYouRatherQuestion extends BaseQuestion {
    type: 'what-would-you-rather';
    options: string[]; // Array of possible answers
}

// Represents a ranking question
export interface RankingQuestion extends BaseQuestion {
    type: 'ranking';
    options: string[]; // Array of categories or items to rank
    goodOrBad: 'good' | 'bad'; // Outcome type for ranking questions
    finalRanking: string[]; // Final ranking of players
}

export interface AnswerBase {
    playerId: string;
    questionId: string;
    pointsAwarded: number;
    answeredAt: string;
}

export interface RankingAnswer extends AnswerBase {
    answer: string[] | "__NOT_ANSWERED__"; // Array of player names or not answered
}
