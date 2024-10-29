import {FC, useState} from "react";
import {WhoWouldRatherQuestion} from "../../../types.ts";
import QuizButton from "./QuizButton.tsx";
import {usePlayer} from "../../../contexts/playerProvider";

interface WhoWouldRatherProps {
    question: WhoWouldRatherQuestion;
}

const WhoWouldRather: FC<WhoWouldRatherProps> = ({question}) => {

    const [answered, setAnswered] = useState(false);
    const {game} = usePlayer();

    // Colors for each option
    const colors = ["blue", "green", "yellow", "red", "amber", "indigo"];

    // Function to map player ID to name
    const mapOptionToPlayerName = (playerId: string) => {
        const player = game?.players.find((p) => p._id === playerId);
        return player ? player.name : playerId; // Fallback to playerId if player is not found
    };

    return (
        <div className="h-screen w-screen flex flex-col text-white">
            {/* Question section (1/3 of the height) */}
            <div className="flex justify-center items-center h-1/3 p-6">
                <h2 className="md:text-4xl text-xl font-bold text-center">{question.question}</h2>
            </div>

            {/* Options section (2/3 of the height) */}
            <div className="h-2/3 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {question.options.map((option, index) => {
                    const playerName = mapOptionToPlayerName(option);
                    return (
                        <QuizButton
                            disabled={answered}
                            onAnswer={() => setAnswered(true)}
                            key={index}
                            option={option}
                            text={playerName}
                            color={colors[index % colors.length]} // Cycle through colors
                            index={index}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WhoWouldRather;
