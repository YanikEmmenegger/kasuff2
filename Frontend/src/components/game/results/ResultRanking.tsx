// /src/components/quiz/results/ResultRanking.tsx

import React from 'react';
import {usePlayer} from '../../../contexts/playerProvider';
import CollapsibleSection from '../../CollapsibleSection';
import PlayersNotAnswered from './PlayersNotAnswered';
import AnswerRanking from './AnswerRanking';
import {Question, RankingAnswer, RankingQuestion} from '../../../types';

const ResultRanking: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentRoundIndex;
    const currentQuestion = game.rounds?.[currentQuestionIndex].data as RankingQuestion;
    const currentAnswers = game.answers?.[currentQuestionIndex] as unknown as RankingAnswer[];

    if (!currentQuestion || !currentAnswers)
        return <div>No question or answers available.</div>;

    // Map player IDs to names
    const playerIdToName: Record<string, string> = {};
    game.players.forEach((player) => {
        playerIdToName[player._id] = player.name;
    });

    // Get the final ranking from the question
    const finalRanking = currentQuestion.finalRanking; // Array of player names

    // Prepare data for each player's submitted ranking
    const playersRankings = currentAnswers
        .filter((answer) => answer.answer !== '__NOT_ANSWERED__')
        .map((answer) => {
            const player = game.players.find((p) => p._id === answer.playerId);
            const ranking = Array.isArray(answer.answer) ? answer.answer : [];
            return {
                name: player?.name || 'Unknown',
                pointsAwarded: answer.pointsAwarded,
                submittedRanking: ranking,
            };
        });

    // Players who did not answer
    const playersNotAnswered = currentAnswers
        .filter((answer) => answer.answer === '__NOT_ANSWERED__')
        .map((answer) => {
            const player = game.players.find((p) => p._id === answer.playerId);
            return {
                name: player?.name || 'Unknown',
                pointsAwarded: answer.pointsAwarded,
            };
        });

    return (
        <div className="w-full flex flex-col text-gray-200 p-8">
            <CollapsibleSection title="Show Results">
                {/* Display the Final Ranking as a card */}
                <h2 className="text-lg font-bold mb-4">{(game.rounds[game.currentRoundIndex].data! as Question).question}</h2>
                <div className="mb-6">
                    <div className="p-4 rounded-lg border-2 shadow-md bg-green-700 border-green-700">
                        <h3 className="text-xl font-bold mb-2 text-green-200">Final Ranking</h3>
                        <ol className="list-decimal list-inside text-sm text-gray-200">
                            {finalRanking.map((playerName, index) => (
                                <li key={index}>{playerName}</li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Display each player's submitted ranking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playersRankings.map((playerRanking, index) => (
                        <AnswerRanking key={index} {...playerRanking} />
                    ))}

                    {playersNotAnswered.length > 0 && (
                        <PlayersNotAnswered players={playersNotAnswered}/>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ResultRanking;
