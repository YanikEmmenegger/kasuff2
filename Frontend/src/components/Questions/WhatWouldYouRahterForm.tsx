// src/components/Questions/WhatWouldYouRatherForm.tsx

import React, {FC, useEffect, useState} from "react";
import {WhatWouldYouRatherQuestion} from "../../types";
import Input from "../Input.tsx";


interface WhatWouldYouRatherFormProps {
    setQuestion: (question: WhatWouldYouRatherQuestion | null) => void;
}

const WhatWouldYouRatherForm: FC<WhatWouldYouRatherFormProps> = ({setQuestion}) => {
    // Local state for question text and options
    const [questionText, setQuestionText] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["", ""]); // Exactly two options

    // Update parent state whenever local state changes and is valid
    useEffect(() => {
        if (
            questionText.trim() &&
            options.length === 2 &&
            options[0].trim() !== "" &&
            options[1].trim() !== ""
        ) {
            const question: WhatWouldYouRatherQuestion = {
                _id: generateUniqueId(), // Implement a unique ID generator or use a library like uuid
                type: 'what-would-you-rather',
                question: questionText.trim(),
                goodOrBad: 'good', // Default to 'good' as per requirement
                options: options.map(opt => opt.trim()),
            };
            setQuestion(question);
        } else {
            setQuestion(null);
        }
    }, [questionText, options, setQuestion]);

    // Handler for changing question text
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionText(e.target.value);
    };

    // Handler for changing an option
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    // Utility function to generate unique IDs (simple version)
    const generateUniqueId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    return (
        <div className="w-full max-w-md bg-cyan-600 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-white">What Would You Rather Question</h2>

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

            {/* Options Inputs */}
            <div className="mb-4">
                <label className="block mb-2 text-white">Options:</label>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <span className="mr-2 text-white">Option {index + 1}:</span>
                        <Input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Enter option ${index + 1}`}
                            required
                            className="bg-cyan-500 text-white placeholder-neutral-300 placeholder-opacity-85"
                        />
                    </div>
                ))}
            </div>

            {/* Display validation messages if any */}
            <div className="mb-4">
                {!questionText.trim() && (
                    <p className="text-red-500">Question is required.</p>
                )}
                {options.some(opt => opt.trim() === "") && (
                    <p className="text-red-500">Both options are required.</p>
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

export default WhatWouldYouRatherForm;
