// src/components/QuestionPage/QuestionPage.tsx

import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Question, QuestionType} from "../types";
import QuestionTypeSelector from "../components/Questions/QuestionTypeSelector";
import MultipleChoiceForm from "../components/Questions/MultipleChoiceForm";
import Button from "../components/Button.tsx";
import toast from "react-hot-toast";
import axios from "axios";
import WhoWouldRatherForm from "../components/Questions/WhoWouldRatherForm.tsx";
import WhatWouldYouRahterForm from "../components/Questions/WhatWouldYouRahterForm.tsx";
import RankingForm from "../components/Questions/RankingForm.tsx";

const QuestionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper function to parse query parameters
    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    const query = useQuery();
    const qType = query.get('qType') as QuestionType | null; // Cast to QuestionType

    // Parse 'step' from query parameters, defaulting to 1 if not present or invalid
    const stepParam = query.get('step');
    const step = stepParam ? parseInt(stepParam, 10) : 1;

    const [question, setQuestion] = useState<Question | null>(null);

    useEffect(() => {
        // Redirect to step=1 if 'step' is invalid or not set
        if (isNaN(step) || step < 1) {
            navigate('?step=1', {replace: true});
            console.log('Invalid or missing step. Redirecting to step=1.');
            return;
        }

        // If step=2 but qType is not set, redirect to step=1
        if (step === 2 && !qType) {
            navigate('?step=1', {replace: true});
            console.log('Missing question type. Redirecting to step=1.');
        }
    }, [step, qType, navigate]);

    // Handler to proceed to the next step (e.g., saving the question)
    const handleNextStep = async () => {
        if (question) {

            const url = import.meta.env.DEV ? "http://localhost:2608" : window.location.host

            const additionalHeaders = {
                "only-admin": true
            }

            try {
                await toast.promise(
                    axios.post(url + '/api/questions', {question: question}, {headers: additionalHeaders}),
                    {
                        loading: 'Creating question...',
                        success: 'Question created successfully!',
                        error: 'Failed to create question. Please try again.',
                    }
                ).then(() => {
                        navigate('?step=3');
                    }
                )

            } catch (e) {

                console.log('Failed to create question', e);
                toast.error('Failed to create question. Please try again.');
            }
        } else {
            console.log('Cannot proceed. The form is incomplete.');
        }
    };

    const renderComponent = () => {
        switch (step) {
            case 1:
                return (
                    <QuestionTypeSelector
                        questionTypes={['multiple-choice', 'who-would-rather', 'what-would-you-rather', 'ranking']}
                    />
                );
            case 2:
                if (qType === 'multiple-choice') {
                    return (
                        <MultipleChoiceForm setQuestion={setQuestion}/>
                    );
                } else if (qType === 'who-would-rather') {
                    return <WhoWouldRatherForm setQuestion={setQuestion}/>;

                } else if (qType === 'what-would-you-rather') {
                    return <WhatWouldYouRahterForm setQuestion={setQuestion}/>;

                } else if (qType === 'ranking') {
                    return <RankingForm setQuestion={setQuestion}/>;

                } else {
                    return <div>Invalid question type selected.</div>;
                }
            case 3:
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-4">Question Created Successfully!</h2>
                        <Button
                            type="button"

                            onClick={() => navigate('?step=1')}
                            className="text-white bg-cyan-600 px-4 py-2 rounded"
                        >
                            Create Another Question
                        </Button>
                    </div>
                );
            default:
                return <div>Unknown step.</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 w-full">
            <h1 className="text-3xl font-bold mb-6">Create a Question</h1>
            {renderComponent()}
            {/* Render Next Button on Step 2 */}
            {step === 2 && (
                <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!question}
                    className={`mt-4 ${question ? 'bg-blue-500' : 'bg-gray-400'} text-white px-4 py-2 rounded`}
                >
                    {question ? 'Save Question' : 'Fill in the form to proceed'}
                </Button>
            )}
        </div>
    );
};

export default QuestionPage;
