import {FC} from "react";

interface AnswerOptionProps {
    option?: string;
    isCorrect?: boolean;
    players?: {
        name?: string;
        pointsAwarded?: number;
        position?: number;
        isCorrect?: boolean;
    }[];
}

const AnswerOption: FC<AnswerOptionProps> = ({option, isCorrect, players}) => {
    if (!option || !players) return null; // Return nothing if option or players are undefined

    return (
        <div
            className={`p-4 rounded-lg border-2 shadow-md ${
                isCorrect ? "border-green-600 bg-green-700" : "border-cyan-700 bg-cyan-700"
            }`}
        >
            <p className={`text-xl font-semibold ${isCorrect ? "text-green-200" : "text-gray-200"}`}>
                {option} {isCorrect && <span className="text-green-300">(Correct)</span>}
            </p>
            <div className="mt-4 space-y-2">
                {players.map((player, index) => {
                    if (!player.name) return null;
                    return (
                        <div
                            key={index}
                            className="flex justify-between items-center bg-cyan-600 p-2 rounded">
                          <span className="text-sm text-gray-200">
                            #{player.position} {player.name}
                          </span>
                            <span
                                className={`text-sm font-bold ${
                                    player.pointsAwarded! > 0 ? "text-green-300" : "text-red-300"
                                }`}
                            >
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
