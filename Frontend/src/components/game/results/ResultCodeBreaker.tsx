// /src/components/quiz/results/ResultWordScramble.tsx

import React from 'react';
import {usePlayer} from '../../../contexts/playerProvider';
import CollapsibleSection from '../../CollapsibleSection';
import PlayersNotAnswered from './PlayersNotAnswered';
import {Answer, CodeBreakerGame} from '../../../types';

const ResultWordScramble: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div className="text-center text-red-500">No game available.</div>;

    const currentQuestionIndex = game.currentRoundIndex;
    const currentRound = game.rounds?.[currentQuestionIndex];
    const currentQuestion = currentRound?.data as CodeBreakerGame
    const currentAnswers = game.answers?.[currentQuestionIndex] as Answer[];

    console.log(currentQuestion)

    if (!currentQuestion || !currentAnswers)
        return <div className="text-center text-red-500">No question or answers available.</div>;

    // Map player IDs to names
    const playerIdToName: Record<string, string> = {};
    game.players.forEach((player) => {
        playerIdToName[player._id] = player.name;
    });

    // Separate players who answered and those who did not
    const answeredPlayers = currentAnswers.filter(
        (answer) => answer.answer !== '__NOT_ANSWERED__'
    ) as Array<Answer & { answer: string[] }>;

    const playersNotAnswered = currentAnswers
        .filter((answer) => answer.answer === '__NOT_ANSWERED__')
        .map((answer) => {
            const player = game.players.find((p) => p._id === answer.playerId);
            return {
                name: player?.name || 'Unknown',
                pointsAwarded: answer.pointsAwarded,
            };
        });

    // Sort answered players by correctness and time
    const sortedAnswers = answeredPlayers.sort((a, b) => {
        if (a.isCorrect !== b.isCorrect) {
            return a.isCorrect ? -1 : 1; // Correct answers first
        } else {
            return new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime(); // Earlier answers first
        }
    });

    return (
        <div className="w-full flex flex-col text-gray-200 p-8">
            <CollapsibleSection title={`Correct was: ${currentQuestion.code} - See answers`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Render each player's result */}
                    {sortedAnswers.map((answer, index) => {
                        const playerName = playerIdToName[answer.playerId] || 'Unknown';
                        const attempts = answer.answer; // This is now an array of strings

                        return (
                            <div
                                key={index}
                                className="flex flex-col justify-between items-start bg-cyan-500 p-4 rounded"
                            >
                                <div
                                    className="flex flex-col md:flex-row md:items-center w-full md:justify-between text-lg text-gray-200 mb-2">
                                    <span>{playerName}</span>
                                    <span
                                        className={`text-lg font-bold ${
                                            answer.pointsAwarded! > 0 ? 'text-green-300' : 'text-red-300'
                                        }`}
                                    >
                    {answer.pointsAwarded! > 0 ? '+' : ''}
                                        {answer.pointsAwarded} Points
                  </span>
                                </div>
                                <div className="w-full">
                                    <span className="text-gray-200">Attempts:</span>
                                    <div className="list-disc list-inside">
                                        {attempts.map((attempt, idx) => {
                                            const isLastAttempt = idx === attempts.length - 1;
                                            const isCorrect = isLastAttempt && answer.isCorrect;

                                            return (
                                                <p
                                                    key={idx}
                                                    className={`text-lg ${
                                                        isCorrect ? 'text-green-300' : 'text-red-300'
                                                    }`}
                                                >
                                                    {attempt}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
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

export default ResultWordScramble;
