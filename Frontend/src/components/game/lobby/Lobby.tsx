import React, { useEffect, useState } from "react";
import { usePlayer } from "../../../contexts/playerProvider";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import JoinedPlayers from "./JoinedPlayers";
import Button from "../../Button";

const Lobby: React.FC = () => {
    const { game, socket, player, kickPlayer, startGame } = usePlayer();
    const [starting, setStarting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!game) navigate("/game?state=join");
    }, [game, navigate]);

    const handleStartGame = async () => {
        if (game && game.players.length < 2) {
            toast.error("Need at least 2 players to start the game.");
            return;
        }

        if (!game || !socket || player?._id !== game.creatorId) return;
        setStarting(true);
        await toast.promise(startGame(), {
            loading: "Starting game...",
            success: "Game started!",
            error: "Failed to start game.",
        });
    };

    const handleCopyGameCode = () => {
        if (game) {
            const gameUrl = `${import.meta.env.VITE_BASE_URL}/game?state=join&code=${game.code}`;
            navigator.clipboard
                .writeText(gameUrl)
                .then(() => {
                    toast.success("Game link copied to clipboard!");
                })
                .catch(() => {
                    toast.error("Failed to copy the game link.");
                });
        }
    };

    return (
        <div className="p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-8 my-10">
            {game ? (
                <>
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Game Lobby</h1>
                        <p className="text-xl text-gray-300 mb-4">Game Code: <strong>{game.code}</strong></p>
                        <Button onClick={handleCopyGameCode} className="bg-blue-500 hover:bg-blue-700 text-lg">
                            Copy Game Link
                        </Button>
                    </div>

                    <div className="flex justify-center">
                        <JoinedPlayers onKickPlayer={kickPlayer} />
                    </div>

                    {player?._id === game.creatorId && (
                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={handleStartGame}
                                loading={starting}
                                className="bg-green-500 hover:bg-green-700 text-xl"
                            >
                                {starting ? "Starting Game..." : "Start Game"}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-white text-center text-2xl">Waiting for game details...</p>
            )}
        </div>
    );
};

export default Lobby;
