// src/components/Questions/MultipleChoiceForm.tsx

import React, {FC, useEffect, useState} from "react";
import {MultipleChoiceQuestion} from "../../types";
import Input from "../Input.tsx";
import Button from "../Button.tsx";


interface MultipleChoiceFormProps {
    setQuestion: (question: MultipleChoiceQuestion | null) => void;
}

const MultipleChoiceForm: FC<MultipleChoiceFormProps> = ({setQuestion}) => {
    // Local state for question and options
    const [questionText, setQuestionText] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["", ""]); // Start with 2 empty options
    const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);

    // Update parent state whenever local state changes and is valid
    useEffect(() => {
        if (questionText.trim() && options.filter(opt => opt.trim()).length >= 2 && correctOptionIndex !== null) {
            const question: MultipleChoiceQuestion = {
                _id: generateUniqueId(), // Implement a unique ID generator or use a library like uuid
                type: 'multiple-choice',
                question: questionText.trim(),
                options: options.map(opt => opt.trim()),
                correctOptionIndex: correctOptionIndex,
            };
            setQuestion(question);
        } else {
            setQuestion(null);
        }
    }, [questionText, options, correctOptionIndex, setQuestion]);

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

    // Handler for adding a new option
    const handleAddOption = () => {
        if (options.length < 6) {
            setOptions([...options, ""]);
        }
    };

    // Handler for removing an option
    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
            // If the removed option was the correct one, reset correctOptionIndex
            if (correctOptionIndex === index) {
                setCorrectOptionIndex(null);
            } else if (correctOptionIndex !== null && index < correctOptionIndex) {
                // Adjust the correctOptionIndex if necessary
                setCorrectOptionIndex(correctOptionIndex - 1);
            }
        }
    };

    // Handler for selecting the correct option
    const handleCorrectOptionChange = (index: number) => {
        setCorrectOptionIndex(index);
    };

    // Utility function to generate unique IDs (simple version)
    const generateUniqueId = (): string => {
        return Math.random().toString(36).substr(2, 9);
    };

    return (
        <div className="w-full max-w-md bg-cyan-600 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Multiple Choice Question</h2>

            {/* Question Input */}
            <div className="mb-4">
                <label className="block mb-2">Question:</label>
                <Input
                    className={"bg-cyan-500 text-white placeholder-neutral-300 placeholder-opacity-85"}
                    type="text"
                    value={questionText}
                    onChange={handleQuestionChange}
                    placeholder="Enter your question here"
                    required
                />
            </div>

            {/* Options Inputs */}
            <div className="mb-4">
                <label className="block  mb-2">Answer Options:</label>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="radio"
                            name="correctOption"
                            checked={correctOptionIndex === index}
                            onChange={() => handleCorrectOptionChange(index)}
                            className="mr-2 bg-cyan-500"
                        />
                        <Input
                            type="text"
                            className={"bg-cyan-500 text-white placeholder-neutral-300 placeholder-opacity-85"}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            required
                        />
                        {options.length > 2 && (
                            <Button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="ml-2 bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ))}

                {/* Add Option Button */}
                {options.length < 6 && (
                    <Button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add Option
                    </Button>
                )}
            </div>

            {/* Display validation messages if any */}
            <div className="mb-4">
                {options.filter(opt => opt.trim()).length < 2 && (
                    <p className="text-red-500">At least 2 options are required.</p>
                )}
                {correctOptionIndex === null && (
                    <p className="text-red-500">Please select the correct option.</p>
                )}
                {options.length > 6 && (
                    <p className="text-red-500">You can add up to 6 options only.</p>
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

export default MultipleChoiceForm;
