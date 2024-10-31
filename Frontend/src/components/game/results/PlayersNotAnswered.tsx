// /src/components/quiz/results/PlayersNotAnswered.tsx

import React from 'react';

interface PlayerInfo {
    name: string;
    pointsAwarded: number;
}

interface PlayersNotAnsweredProps {
    players: PlayerInfo[];
}

const PlayersNotAnswered: React.FC<PlayersNotAnsweredProps> = ({players}) => {
    return (
        <div className="p-4 rounded-lg border-2 shadow-md bg-red-700 border-red-700">
            <p className="text-xl font-semibold text-gray-200">Players Not Answered</p>
            <div className="mt-2 space-y-2">
                {players.map((player, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center bg-red-600 p-2 rounded"
                    >
                        <span className="text-sm text-gray-200">{player.name}</span>
                        <span className="text-sm font-bold text-red-300">
              {player.pointsAwarded > 0 ? '+' : ''}
                            {player.pointsAwarded} Points
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayersNotAnswered;
