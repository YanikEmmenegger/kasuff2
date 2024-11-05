// /src/components/quiz/results/ResultHideAndSeek.tsx

import React from 'react';
import {usePlayer} from '../../../contexts/playerProvider';
import CollapsibleSection from '../../CollapsibleSection';
import PlayersNotAnswered from './PlayersNotAnswered';
import {Answer} from '../../../types';

const ResultHideAndSeek: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div className="text-center text-red-500">No game available.</div>;

    const currentQuestionIndex = game.currentRoundIndex;
    const currentRound = game.rounds?.[currentQuestionIndex];
    const currentQuestion = currentRound?.data as { type: 'hide-and-seek'; /* other fields if any */ };
    const currentAnswers = game.answers?.[currentQuestionIndex] as Answer[];

    if (!currentQuestion || !currentAnswers)
        return <div className="text-center text-red-500">No question or answers available.</div>;

    // Map player IDs to names for easy lookup
    const playerIdToName: Record<string, string> = {};
    game.players.forEach((player) => {
        playerIdToName[player._id] = player.name;
    });

    // Separate players who answered and those who did not
    const answeredAnswers = currentAnswers.filter(
        (answer) => typeof answer.answer === 'number'
    ) as Array<Answer & { answer: number }>;

    const playersNotAnswered = currentAnswers
        .filter((answer) => answer.answer === '__NOT_ANSWERED__')
        .map((answer) => {
            const player = game.players.find((p) => p._id === answer.playerId);
            return {
                name: player?.name || 'Unknown',
                pointsAwarded: answer.pointsAwarded,
            };
        });

    // Sort answered players by their answer (ascending), then by answeredAt (ascending)
    const sortedAnswers = answeredAnswers.sort((a, b) => {
        if (a.answer !== b.answer) {
            return a.answer - b.answer; // Lower answer (better) first
        } else {
            return new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime(); // Earlier answeredAt first
        }
    });

    return (
        <div className="w-full flex flex-col text-gray-200 p-8">
            <CollapsibleSection title="Show Hide and Seek Results">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Render each player's result */}
                    {sortedAnswers.map((answer, index) => {
                        const playerName = playerIdToName[answer.playerId] || 'Unknown';
                        return (
                            <div key={index}
                                 className="flex gap-4 flex-col justify-between items-center bg-cyan-500 p-2 rounded">
                              <span className="flex items-center w-full justify-between text-lg text-gray-200">

                                {playerName}
                                  <span
                                      className={`text-lg font-bold ${answer.pointsAwarded! > 0 ? "text-green-300" : "text-red-300"}`}>
                                {answer.pointsAwarded! > 0 ? "+" : ""}{answer.pointsAwarded} Points
                                </span>
                              </span>
                                <span className="flex items-center w-full gap-3 justify-start text-lg text-gray-200">

                                Attempts:
                                    <span
                                        className={`text-lg font-bold ${answer.answer! < 10 ? "text-green-300" : "text-red-300"}`}>{answer.answer}
                                </span>
                              </span>
                            </div>
                        )
                            ;
                    })}

                    {/* Render players who did not answer */}
                    {playersNotAnswered.length > 0 && (
                        <PlayersNotAnswered players={playersNotAnswered}/>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ResultHideAndSeek;
