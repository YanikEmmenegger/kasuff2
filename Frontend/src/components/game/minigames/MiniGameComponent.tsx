import {FC} from "react";
import {MiniGame} from "../../../types";
import HideAndSeek from "../minigames/hideAndSeek/HideAndSeek.tsx";
import Timer from "../round/Timer.tsx";
import Memory from "./memory/Memory.tsx";
import SequenceMemory from "./sequence/SequenceMemory.tsx";
import WordScramble from "./wordScramble/WordScramble.tsx";
import CodeBreakerGame from "./codeBreaker/CodeBreaker.tsx";

interface QuizProps {
    miniGame: MiniGame;
}

const QuizComponent: FC<QuizProps> = ({miniGame}) => {
    const renderQuestionType = () => {
        switch (miniGame.type) {
            case "hide-and-seek":
                return <HideAndSeek/>
            case "memory":
                return <Memory/>
            case "sequence-memory":
                return <SequenceMemory/>
            case "word-scramble":
                return <WordScramble/>
            case "code-breaker":
                return <CodeBreakerGame/>;
            default:
                return <>Unknown Mini Game</>;
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
