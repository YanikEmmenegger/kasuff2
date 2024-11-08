import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import AnswerOption from "./AnswerOption";
import PlayersNotAnswered from "./PlayersNotAnswered";
import CollapsibleSection from "../../CollapsibleSection";
import {Question, WhoWouldRatherQuestion} from "../../../types.ts";

const ResultWhoWouldRather: React.FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentRoundIndex;
    const currentQuestion = game.rounds?.[currentQuestionIndex].data as WhoWouldRatherQuestion;
    const currentAnswers = game.answers?.[currentQuestionIndex];

    if (!currentQuestion || !currentAnswers)
        return <div>No question or answers available.</div>;

    const sortedLeaderboard = [...game.leaderboard].sort(
        (a, b) => b.totalPoints - a.totalPoints
    );

    // Map player IDs in options to their names
    const mapOptionToPlayerName = (playerId: string) => {
        const player = game.players.find((p) => p._id === playerId);
        return player ? player.name : playerId;
    };

    // Map the options from IDs to player names
    const playerOptions = currentQuestion.options.map(mapOptionToPlayerName);

    // Count votes for each option
    const voteCounts: Record<string, number> = {};

    // Ensure each answer is valid and count votes
    currentAnswers.forEach((answer) => {
        if (typeof answer.answer === "string" && answer.answer !== "__NOT_ANSWERED__") {
            const playerName = mapOptionToPlayerName(answer.answer);
            voteCounts[playerName] = (voteCounts[playerName] || 0) + 1;
        } else {
            console.error("Invalid answer detected:", answer.answer);
        }
    });

    // Get the option(s) with the most votes
    const maxVotes = Math.max(...Object.values(voteCounts));

    // Determine which options have the most votes
    const mostVotedOptions = playerOptions.filter(
        (option) => voteCounts[option] === maxVotes
    );

    const groupedPlayersByOption = currentQuestion.options.map((optionId) => {
        const playerName = mapOptionToPlayerName(optionId);

        return {
            option: playerName,
            isCorrect: mostVotedOptions.includes(playerName),
            players: currentAnswers
                .filter((answer) => answer.answer === optionId)
                .map((answer) => {
                    const player = game.players.find((p) => p._id === answer.playerId);
                    return {
                        name: player?.name,
                        pointsAwarded: answer.pointsAwarded,
                        position:
                            sortedLeaderboard.findIndex((entry) => entry.playerId === player?._id) + 1,
                    };
                }),
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
        <div className=" w-full flex flex-col text-gray-200 p-8">
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

export default ResultWhoWouldRather;
