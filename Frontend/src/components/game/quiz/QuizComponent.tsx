import {FC} from "react";
import {Question} from "../../../types.ts";
import MultipleChoice from "./MultipleChoice.tsx";
import WhoWouldRather from "./WhoWouldRather.tsx";
import WhatWouldYouRather from "./WhatWouldYouRather.tsx";
import Timer from "./Timer.tsx";

interface QuizProps {
    question: Question;
}

const QuizComponent: FC<QuizProps> = ({question}) => {

    const renderQuestionType = () => {
        switch (question.type) {
            case "multiple-choice":
                return <MultipleChoice question={question}/>;
            case "who-would-rather":
                return <WhoWouldRather question={question}/>;
            case "what-would-you-rather":
                return <WhatWouldYouRather question={question}/>;
            case "ranking":
                return <>Ranking</>;
            default:
                return <>Unknown question type</>;
        }
    };

    // Return the result of the renderQuestionType function directly inside the JSX
    return (
        <div>
            <Timer/>
            {renderQuestionType()}
        </div>
    );
};

export default QuizComponent;
