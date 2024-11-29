// src/components/Questions/RankingForm.tsx

import React, {FC, useEffect, useState} from "react";
import {RankingQuestion} from "../../types";
import Input from "../Input.tsx";

interface RankingFormProps {
    setQuestion: (question: RankingQuestion | null) => void;
}

const RankingForm: FC<RankingFormProps> = ({setQuestion}) => {
    // Local state for question text
    const [questionText, setQuestionText] = useState<string>("");

    // Update parent state whenever local state changes and is valid
    useEffect(() => {
        if (questionText.trim()) {
            const question: RankingQuestion = {
                _id: generateUniqueId(), // Implement a unique ID generator or use a library like uuid
                type: 'ranking',
                question: questionText.trim(),
                options: [], // Set to empty array as per requirement
                goodOrBad: 'good', // Default value; adjust if needed
                finalRanking: [], // Set to empty array as per requirement
            };
            setQuestion(question);
        } else {
            setQuestion(null);
        }
    }, [questionText, setQuestion]);

    // Handler for changing question text
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(e.target.value);
    };

    // Utility function to generate unique IDs (simple version)
    const generateUniqueId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    return (
        <div className="w-full max-w-md bg-cyan-600 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-white">Ranking Question</h2>

            {/* Question Input */}
            <div className="mb-4">
                <label className="block mb-2 text-white">Question:</label>
                <Input
                    type="text"
                    value={questionText}
                    onChange={handleQuestionChange}
                    placeholder="Enter your question here"
                    required
                    className="bg-cyan-500 text-white placeholder-neutral-300 placeholder-opacity-85"
                />
            </div>

            {/* Display validation messages if any */}
            <div className="mb-4">
                {!questionText.trim() && (
                    <p className="text-red-500">Question is required.</p>
                )}
            </div>

            {/* Optional: Next or Save Button */}
            {/*
            <Button
                type="button"
                onClick={handleNextStep}
                disabled={!isFormValid}
                className={`w-full ${isFormValid ? 'bg-blue-500' : 'bg-gray-400'} text-white px-4 py-2 rounded`}
            >
                Next
            </Button>
            */}
        </div>
    );
};

export default RankingForm;
