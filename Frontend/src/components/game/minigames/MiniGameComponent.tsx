import {FC} from "react";
import {MiniGame} from "../../../types";
import HideAndSeek from "../minigames/hideAndSeek/HideAndSeek.tsx";
import Timer from "../round/Timer.tsx";
import Memory from "./memory/Memory.tsx";

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
