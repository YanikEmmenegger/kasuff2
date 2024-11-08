import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import AnswerOption from "./AnswerOption";
import PlayersNotAnswered from "./PlayersNotAnswered";
import CollapsibleSection from "../../CollapsibleSection";
import {Question, WhatWouldYouRatherQuestion} from "../../../types.ts";

const ResultWhatWouldYouRather: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentRoundIndex;
    const currentQuestion = game.rounds?.[currentQuestionIndex].data as WhatWouldYouRatherQuestion;
    const currentAnswers = game.answers?.[currentQuestionIndex];

    if (!currentQuestion || !currentAnswers)
        return <div>No question or answers available.</div>;

    const sortedLeaderboard = [...game.leaderboard].sort(
        (a, b) => b.totalPoints - a.totalPoints
    );

    const groupedPlayersByOption = currentQuestion.options.map((option) => ({
        option,
        isCorrect: false, // No "correct" answer for What Would You Rather
        players: currentAnswers
            .filter((answer) => answer.answer === option)
            .map((answer) => {
                const player = game.players.find((p) => p._id === answer.playerId);
                return {
                    name: player?.name,
                    pointsAwarded: answer.pointsAwarded,
                    position:
                        sortedLeaderboard.findIndex((entry) => entry.playerId === player?._id) + 1,
                };
            }),
    }));

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
            <CollapsibleSection title="Show Answers">
                <h2 className="text-lg font-bold mb-4">{(game.rounds[game.currentRoundIndex].data! as Question).question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedPlayersByOption.map((optionGroup, index) => (
                        <AnswerOption key={index} {...optionGroup} />
                    ))}

                    {playersNotAnswered.length > 0 && (
                        <PlayersNotAnswered players={playersNotAnswered}/>
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default ResultWhatWouldYouRather;
