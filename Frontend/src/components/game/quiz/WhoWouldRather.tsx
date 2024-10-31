import {FC, useState} from "react";
import {WhoWouldRatherQuestion} from "../../../types";
import QuizButton from "./QuizButton";
import {usePlayer} from "../../../contexts/playerProvider";
import {motion} from "framer-motion";

interface WhoWouldRatherProps {
    question: WhoWouldRatherQuestion;
}

const WhoWouldRather: FC<WhoWouldRatherProps> = ({question}) => {
    const [answered, setAnswered] = useState(false);
    const {game} = usePlayer();


    // Colors for each option
    const colors = ["blue", "green", "red", "amber", "indigo"];

    // Function to map player ID to name
    const mapOptionToPlayerName = (playerId: string) => {
        const player = game?.players.find((p) => p._id === playerId);
        return player ? player.name : playerId; // Fallback to playerId if player is not found
    };

    return (
        <div className="min-h-[90%] h-auto w-full flex flex-col text-gray-200 bg-cyan-500">
            {/* Question section */}
            <motion.div
                className="flex justify-center items-center h-1/3 p-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6}}
            >
                <h2 className="md:text-4xl text-2xl font-bold text-center">
                    {question.question}
                </h2>
            </motion.div>

            {/* Options section */}
            <motion.div
                className="flex-1 p-6 grid grid-cols-1 mb-10 md:grid-cols-2 gap-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2, duration: 0.6}}
            >
                {question.options.map((option, index) => {
                    const playerName = mapOptionToPlayerName(option);
                    return (
                        <QuizButton
                            disabled={answered}
                            onAnswer={() => setAnswered(true)}
                            key={index}
                            isPlayer={true}
                            option={option}
                            text={playerName}
                            color={colors[index % colors.length]} // Cycle through colors
                            index={index}
                        />
                    );
                })}
            </motion.div>
        </div>
    );
};

export default WhoWouldRather;
