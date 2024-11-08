import {FC} from "react";
import {
    MultipleChoiceQuestion,
    Question,
    RankingQuestion,
    WhatWouldYouRatherQuestion,
    WhoWouldRatherQuestion
} from "../../../types";
import MultipleChoice from "./MultipleChoice";
import WhoWouldRather from "./WhoWouldRather";
import WhatWouldYouRather from "./WhatWouldYouRather";
import Timer from "./Timer";
import Ranking from "./Ranking.tsx";
import SpyGame from "../minigames/spy/SpyComponent.tsx";

interface QuizProps {
    question: Question;
}

const QuizComponent: FC<QuizProps> = ({question}) => {
    const renderQuestionType = () => {
        switch (question.type) {
            case "multiple-choice":
                return <MultipleChoice question={question as MultipleChoiceQuestion}/>;
            case "who-would-rather":
                return <WhoWouldRather question={question as WhoWouldRatherQuestion}/>;
            case "what-would-you-rather":
                return <WhatWouldYouRather question={question as WhatWouldYouRatherQuestion}/>;
            case "ranking":
                return <Ranking question={question as RankingQuestion}></Ranking>;
            case "spy":
                return <SpyGame></SpyGame>;
            default:
                return <>Unknown question type</>;
        }
    };

    return (
        <div className="relative">
            {question.type !== "spy" && <Timer/>}
            {renderQuestionType()}
        </div>
    );
};

export default QuizComponent;
