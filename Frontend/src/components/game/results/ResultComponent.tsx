import {FC} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import ResultMultipleChoice from "./ResultMultipleChoice";
import ResultWhoWouldRather from "./ResultWhoWouldRather";
import ResultWhatWouldYouRather from "./ResultWhatWouldYouRather";
import PunishmentComponent from "./PunishmentComponent";
import ResultRanking from "./ResultRanking.tsx";
import ResultHideAndSeek from "./ResultHideAndSeek.tsx";
import ResultSequenceMemory from "./ResultSequenceMemory.tsx";
import ResultMemory from "./ResultMemory.tsx";
import ResultWordScramble from "./ResultWordScramble.tsx";
import ResultCodeBreaker from "./ResultCodeBreaker.tsx";

const ResultComponent: FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentRoundIndex = game.currentRoundIndex;
    const currentRound = game.rounds[currentRoundIndex];

    if (!currentRound) return <div>No question available.</div>;

    // Determine which result component to show based on the question type
    const renderResultComponent = () => {
        switch (currentRound.data?.type) {
            case "multiple-choice":
                return <ResultMultipleChoice/>;

            case "who-would-rather":
                return <ResultWhoWouldRather/>;

            case "what-would-you-rather":
                return <ResultWhatWouldYouRather/>;

            case "ranking":
                return <ResultRanking/>
            case "hide-and-seek":
                return <ResultHideAndSeek/>;
            case "sequence-memory":
                return <ResultSequenceMemory/>;
            case "memory":
                return <ResultMemory/>;
            case "word-scramble":
                return <ResultWordScramble/>;
            case "code-breaker":
                return <ResultCodeBreaker/>;


            default:
                return <div></div>;
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
