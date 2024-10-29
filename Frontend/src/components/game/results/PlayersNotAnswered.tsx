import {FC} from "react";

interface PlayersNotAnsweredProps {
    players?: { name?: string; pointsAwarded?: number; position?: number }[];
}

const PlayersNotAnswered: FC<PlayersNotAnsweredProps> = ({players}) => {
    if (!players || players.length === 0) return null; // Return nothing if no players are provided

    return (
        <div className="md:p-4 p-2 rounded-lg border-2 border-gray-700">
            <p className="md:text-xl text-lg font-semibold text-red-400">Players who didn't answer:</p>
            <div className="md:mt-4 mt-2 space-y-2">
                {players.map((player, index) => {
                    if (!player.name) return null;
                    return (
                        <div key={index} className="flex justify-between items-center bg-gray-600 p-2 rounded">
                            <span className="text-xs md:text-sm">
                                #{player.position} {player.name}
                            </span>
                            <span className="text-xs md:text-sm font-bold text-red-400">
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
