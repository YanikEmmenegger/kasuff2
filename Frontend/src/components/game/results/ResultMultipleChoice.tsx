import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import AnswerOption from "./AnswerOption";
import PlayersNotAnswered from "./PlayersNotAnswered";
import CollapsibleSection from "../../CollapsibleSection.tsx";

const ResultMultipleChoice: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentQuestionIndex;
    const currentQuestion = game.cleanedQuestions?.[currentQuestionIndex];
    const currentAnswers = game.answers?.[currentQuestionIndex];

    if (!currentQuestion || !currentAnswers)
        return <div>No question or answers available.</div>;

    const sortedLeaderboard = [...game.leaderboard].sort(
        (a, b) => b.totalPoints - a.totalPoints
    );


    const groupedPlayersByOption = currentQuestion.options.map((option, index) => ({
        option,
        isCorrect: index === currentQuestion.correctOptionIndex,
        players: currentAnswers
            .filter((answer) => answer.answer === option)
            .map((answer) => {
                const player = game.players.find((p) => p._id === answer.playerId);
                return {
                    name: player?.name,
                    pointsAwarded: answer.pointsAwarded,
                    position:
                        sortedLeaderboard.findIndex((entry) => entry.playerId === player?._id) + 1,
                    isCorrect: answer.isCorrect,
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

export default ResultMultipleChoice;
