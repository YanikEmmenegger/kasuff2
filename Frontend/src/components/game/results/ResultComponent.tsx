import {FC} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import ResultMultipleChoice from "./ResultMultipleChoice";
import ResultWhoWouldRather from "./ResultWhoWouldRather";
import ResultWhatWouldYouRather from "./ResultWhatWouldYouRather";
import PunishmentComponent from "./PunishmentComponent";
import ResultRanking from "./ResultRanking.tsx";

const ResultComponent: FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentQuestionIndex;
    const currentQuestion = game.cleanedQuestions[currentQuestionIndex];

    if (!currentQuestion) return <div>No question available.</div>;

    // Determine which result component to show based on the question type
    const renderResultComponent = () => {
        switch (currentQuestion.type) {
            case "multiple-choice":
                return <ResultMultipleChoice/>;

            case "who-would-rather":
                return <ResultWhoWouldRather/>;

            case "what-would-you-rather":
                return <ResultWhatWouldYouRather/>;

            case "ranking":
                return <ResultRanking/>;

            default:
                return <div>Unknown question type.</div>;
        }
    };

    return (
        <div className="h-auto w-full flex flex-col items-center text-gray-200">
            <PunishmentComponent/>
            {renderResultComponent()}
        </div>
    );
};

export default ResultComponent;
