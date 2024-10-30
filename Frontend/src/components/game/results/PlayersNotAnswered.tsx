import {FC} from "react";

interface PlayersNotAnsweredProps {
    players?: { name?: string; pointsAwarded?: number; position?: number }[];
}

const PlayersNotAnswered: FC<PlayersNotAnsweredProps> = ({players}) => {
    if (!players || players.length === 0) return null; // Return nothing if no players are provided

    return (
        <div className="p-4 rounded-lg border-2 border-red-600 bg-red-700 shadow-md">
            <p className="text-xl font-semibold text-gray-200">Players who didn't answer:</p>
            <div className="mt-4 space-y-2">
                {players.map((player, index) => {
                    if (!player.name) return null;
                    return (
                        <div
                            key={index}
                            className="flex justify-between items-center bg-cyan-600 p-2 rounded"
                        >
              <span className="text-sm text-gray-200">
                #{player.position} {player.name}
              </span>
                            <span className="text-sm font-bold text-red-300">
                {player.pointsAwarded} Points
              </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlayersNotAnswered;
