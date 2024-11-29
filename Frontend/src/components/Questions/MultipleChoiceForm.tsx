// src/components/QuestionPage/MultipleChoiceForm.tsx

import React, { useState } from 'react';
import Button from '../Button'; // Adjust the import path as necessary
import toast from 'react-hot-toast';
import axios from 'axios';
import { MultipleChoiceQuestion } from '../../types'; // Adjust the import path

interface MultipleChoiceFormProps {
    onSuccess: () => void;
}

const MultipleChoiceForm: React.FC<MultipleChoiceFormProps> = ({ onSuccess }) => {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        if (correctOptionIndex === index) {
            setCorrectOptionIndex(null);
        } else if (correctOptionIndex && index < correctOptionIndex) {
            setCorrectOptionIndex(correctOptionIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!questionText.trim()) {
            toast.error('Question text cannot be empty.');
            return;
        }

        if (options.length < 2) {
            toast.error('At least two options are required.');
            return;
        }

        for (let option of options) {
            if (!option.trim()) {
                toast.error('Options cannot be empty.');
                return;
            }
        }

        if (correctOptionIndex === null || correctOptionIndex >= options.length) {
            toast.error('Please select a correct option.');
            return;
        }

        const newQuestion: MultipleChoiceQuestion = {
            _id: '', // Backend will assign the ID
            type: 'multiple-choice',
            question: questionText,
            options,
            correctOptionIndex,
        };

        try {
            setIsSubmitting(true);
            const response = await axios.post('/questions', { question: newQuestion });

            console.log('Question created:', response.data.question);
            toast.success('Multiple Choice Question created successfully!');
            // Reset form
            setQuestionText('');
            setOptions(['', '']);
            setCorrectOptionIndex(null);
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create question.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700">Question Text:</label>
                <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700">Options:</label>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            type="radio"
                            name="correctOption"
                            checked={correctOptionIndex === index}
                            onChange={() => setCorrectOptionIndex(index)}
                            className="ml-2"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            disabled={options.length <= 2}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <Button type="button" onClick={addOption} className="mt-2">
                    Add Option
                </Button>
            </div>

            <div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Create Multiple Choice Question'}
                </Button>
            </div>
        </form>
    );
};

export default MultipleChoiceForm;
