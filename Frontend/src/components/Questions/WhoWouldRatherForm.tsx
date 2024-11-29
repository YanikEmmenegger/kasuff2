// src/components/Questions/WhoWouldRatherForm.tsx

import React, {FC, useEffect, useState} from "react";
import {WhoWouldRatherQuestion} from "../../types";
import Input from "../Input.tsx";

interface WhoWouldRatherFormProps {
    setQuestion: (question: WhoWouldRatherQuestion | null) => void;
}

const WhoWouldRatherForm: FC<WhoWouldRatherFormProps> = ({setQuestion}) => {
    // Local state for question text and goodOrBad selection
    const [questionText, setQuestionText] = useState<string>("");
    const [goodOrBad, setGoodOrBad] = useState<'good' | 'bad' | "">("");

    // Update parent state whenever local state changes and is valid
    useEffect(() => {
        if (questionText.trim() && (goodOrBad === 'good' || goodOrBad === 'bad')) {
            const question: WhoWouldRatherQuestion = {
                _id: generateUniqueId(), // Implement a unique ID generator or use a library like uuid
                type: 'who-would-rather',
                question: questionText.trim(),
                options: [], // As per requirement, options are an empty array
                goodOrBad: goodOrBad as 'good' | 'bad',
            };
            setQuestion(question);
        } else {
            setQuestion(null);
        }
    }, [questionText, goodOrBad, setQuestion]);

    // Handler for changing question text
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(e.target.value);
    };

    // Handler for selecting good or bad
    const handleGoodOrBadChange = (value: 'good' | 'bad') => {
        setGoodOrBad(value);
    };

    // Utility function to generate unique IDs (simple version)
    const generateUniqueId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    return (
        <div className="w-full max-w-md bg-cyan-600 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-white">Who Would Rather Question</h2>

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

            {/* Good or Bad Selection */}
            <div className="mb-4">
                <label className="block mb-2 text-white">Punishment Type:</label>
                <div className="flex items-center">
                    <label className="mr-4 flex items-center text-white">
                        <input
                            type="radio"
                            name="goodOrBad"
                            value="good"
                            checked={goodOrBad === 'good'}
                            onChange={() => handleGoodOrBadChange('good')}
                            className="mr-2"
                        />
                        Good
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="radio"
                            name="goodOrBad"
                            value="bad"
                            checked={goodOrBad === 'bad'}
                            onChange={() => handleGoodOrBadChange('bad')}
                            className="mr-2"
                        />
                        Bad
                    </label>
                </div>
            </div>

            {/* Display validation messages if any */}
            <div className="mb-4">
                {!questionText.trim() && (
                    <p className="text-red-500">Question is required.</p>
                )}
                {goodOrBad === "" && (
                    <p className="text-red-500">Please select the punishment type.</p>
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

export default WhoWouldRatherForm;
