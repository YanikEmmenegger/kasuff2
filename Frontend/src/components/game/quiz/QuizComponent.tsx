import  {FC} from "react";
import {Question} from "../../../types";
import MultipleChoice from "./MultipleChoice";
import WhoWouldRather from "./WhoWouldRather";
import WhatWouldYouRather from "./WhatWouldYouRather";
import Timer from "./Timer";

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

    return (
        <div className="relative">
            <Timer/>
            {renderQuestionType()}
        </div>
    );
};

export default QuizComponent;
