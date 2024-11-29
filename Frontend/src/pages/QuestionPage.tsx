// src/components/QuestionPage/QuestionPage.tsx

import React from 'react';
import {useLocation} from 'react-router-dom';
import {QuestionType} from "../types.ts";
import MultipleChoiceForm from "../components/Questions/MultipleChoiceForm.tsx";

const QuestionPage: React.FC = () => {
    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();
    const state = query.get('qType') as QuestionType | null; // Cast to QuestionType


    const handleSuccess = () => {
        // Optionally, refresh the page or fetch updated questions
    };

    const renderComponent = () => {
        switch (state) {
            case 'multiple-choice':
                return <MultipleChoiceForm onSuccess={handleSuccess}/>;

            default:
                return <div className="text-center text-gray-700">Select a question type to create.</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 w-full">
            <h1 className="text-3xl font-bold mb-6 text-center">Create a New Question</h1>
            <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-8 bg-white p-6 rounded-lg shadow">
                {renderComponent()}
            </div>
        </div>
    );
};

export default QuestionPage;
