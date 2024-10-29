import {FC} from "react";

interface AnswerOptionProps {
    option?: string;
    isCorrect?: boolean;
    players?: { name?: string; pointsAwarded?: number; position?: number; isCorrect?: boolean }[];
}

const AnswerOption: FC<AnswerOptionProps> = ({option, isCorrect, players}) => {
    if (!option || !players) return null; // Return nothing if option or players are undefined

    return (
        <div className={`md:p-4 p-2 rounded-lg border-2 ${isCorrect ? "border-green-600" : "border-gray-700"}`}>
            <p className={`md:text-xl text-lg font-semibold ${isCorrect ? "text-green-400" : "text-gray-300"}`}>{option}</p>
            <div className="md:mt-4 mt-2 space-y-2">
                {players.map((player, index) => {
                    if (!player.name) return null;
                    return (
                        <div key={index} className="flex justify-between items-center bg-gray-600 p-2 rounded">
                            <span className="md:text-sm text-xs">
                                #{player.position} {player.name}
                            </span>
                            <span
                                className={`md:text-sm text-xs font-bold ${player.pointsAwarded! > 0 ? "text-green-400" : "text-red-400"}`}>
                                {player.pointsAwarded! > 0 ? "+" : ""}
                                {player.pointsAwarded} Points
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnswerOption;
