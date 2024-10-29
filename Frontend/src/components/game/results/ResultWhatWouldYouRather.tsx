import {FC} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import AnswerOption from "./AnswerOption";
import PlayersNotAnswered from "./PlayersNotAnswered";

const ResultWhatWouldYouRather: FC = () => {
    const {game} = usePlayer();
    if (!game) return <div>No game available.</div>;

    const currentQuestionIndex = game.currentQuestionIndex;
    const currentQuestion = game.cleanedQuestions?.[currentQuestionIndex];
    const currentAnswers = game.answers?.[currentQuestionIndex];

    if (!currentQuestion || !currentAnswers) return <div>No question or answers available.</div>;

    const sortedLeaderboard = [...game.leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);

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
                    position: sortedLeaderboard.findIndex((entry) => entry.playerId === player?._id) + 1,
                };
            }),
    }));

    const playersNotAnswered = currentAnswers
        .filter((answer) => answer.answer === "__NOT_ANSWERED__")
        .map((answer) => {
            const player = game.players.find((p) => p._id === answer.playerId);
            return {
                name: player?.name,
                pointsAwarded: answer.pointsAwarded,
                position: sortedLeaderboard.findIndex((entry) => entry.playerId === player?._id) + 1,
            };
        });

    return (
        <div className="h-auto w-screen flex flex-col text-white p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedPlayersByOption.map((optionGroup, index) => (
                    <AnswerOption key={index} {...optionGroup} />
                ))}

                {playersNotAnswered.length > 0 && (
                    <PlayersNotAnswered players={playersNotAnswered}/>
                )}
            </div>
        </div>
    );
};

export default ResultWhatWouldYouRather;
