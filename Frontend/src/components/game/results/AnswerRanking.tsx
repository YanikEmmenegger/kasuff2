// /src/components/quiz/results/AnswerRanking.tsx

import React from 'react';

interface AnswerRankingProps {
    name: string;
    pointsAwarded: number;
    submittedRanking: string[]; // Player names in the order submitted
}

const AnswerRanking: React.FC<AnswerRankingProps> = ({
                                                         name,
                                                         pointsAwarded,
                                                         submittedRanking,
                                                     }) => {
    // Determine the color class based on pointsAwarded
    const pointsColorClass =
        pointsAwarded > 0
            ? 'text-green-300'
            : pointsAwarded < 0
                ? 'text-red-300'
                : 'text-gray-200';

    return (
        <div className="p-4 rounded-lg border-2 shadow-md bg-cyan-700 border-cyan-700">
            <p className="text-xl font-semibold text-gray-200">{name}</p>
            <div className="mt-2 text-sm text-gray-200">
                <p>
                    Points Awarded:{' '}
                    <span className={`font-bold ${pointsColorClass}`}>
            {pointsAwarded > 0 ? '+' : ''}
                        {pointsAwarded}
          </span>
                </p>
            </div>
            <div className="mt-4">
                <p className="text-sm text-gray-200 font-semibold">Submitted Ranking:</p>
                <ol className="list-decimal list-inside text-sm text-gray-200">
                    {submittedRanking.map((playerName, index) => (
                        <li key={index}>{playerName}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default AnswerRanking;
