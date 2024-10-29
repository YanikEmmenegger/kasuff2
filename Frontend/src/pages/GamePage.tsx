import {useLocation} from "react-router-dom";
import Lobby from "../components/game/lobby/Lobby.tsx";
import GameCreator from "../components/game/create/GameCreator.tsx";
import JoinGameForm from "../components/game/join/JoinGameForm.tsx";
import LeaveButton from "../components/game/LeaveButton.tsx";
import WaitingRoom from "../components/game/waiting/WaitingRoom.tsx";
import {usePlayer} from "../contexts/playerProvider.tsx";
import QuizComponent from "../components/game/quiz/QuizComponent.tsx";
import ResultComponent from "../components/game/results/ResultComponent.tsx";
import LeaderboardComponent from "../components/game/leaderboard/LeaderboardComponent.tsx";
import {useEffect} from "react";
import NextQuestionButton from "../components/game/results/NextQuestionButton.tsx";

// Helper function to parse query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const GamePage = () => {
    const query = useQuery();
    const state = query.get("state") || "join"; // Default to 'join' if state is not provided
    const code = query.get("code") || "";

    const {game} = usePlayer();

    useEffect(() => {
        // when no game is available and state isn't join, create or lobby, redirect to join
        if (!game && state !== "join" && state !== "create" && state !== "lobby") {
            window.location.href = "/";
        }
    }, [game, state]);

    const renderComponent = () => {
        switch (state) {
            case "lobby":
                return <Lobby/>;
            case "create":
                return <GameCreator/>;
            case "join":
                return <JoinGameForm _gameCode={code}/>;
            case "leaderboard":
                return <LeaderboardComponent/>;
            case "quiz":
                return game ? <QuizComponent question={game.cleanedQuestions[game.currentQuestionIndex]}/> : <></>;
            case "results":
                return game ? <ResultComponent/> : <></>;
            case "waiting":
                return <WaitingRoom/>;
            default:
                return <JoinGameForm _gameCode={code}/>;
        }
    };

    return (
        <div className="w-screen min-h-screen justify-between flex flex-col">
            {/* Content Section - expands to take up remaining space */}
            <div className="flex-1 flex justify-center">
                {renderComponent()}
            </div>

            {/* Leave Button */}
            {state !== "join" && state !== "create" && state !== "quiz" && state !== 'waiting' && (
                <div className="flex flex-row justify-between px-8 pb-4">
                    <LeaveButton/>
                    <NextQuestionButton/>
                </div>
            )}
        </div>
    );
};

export default GamePage;