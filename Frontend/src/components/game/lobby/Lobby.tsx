import React, {useEffect, useState} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import {useNavigate} from "react-router";
import {motion} from "framer-motion";
import JoinedPlayers from "./JoinedPlayers";
import Button from "../../Button";
import {FaCopy, FaGamepad} from "react-icons/fa";
import Quote from "../../Quote.tsx";
import toast from "react-hot-toast";

const Lobby: React.FC = () => {
    const { game, socket, player, kickPlayer, startGame } = usePlayer();
    const [starting, setStarting] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        if (!game) navigate("/game?state=join");
    }, [game, navigate]);

    useEffect(() => {
        setInterval(() => {

        }, 15000)
    }, []);


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

    const handleCopyGameCode = async () => {
        if (!game) {
            toast.error("No game information available to copy.");
            return;
        }

        const srv = import.meta.env.DEV ? "http://localhost:5173" : window.location.origin;
        const gameUrl = `${srv}/game?state=join&code=${game.code}`;

        // Check if Clipboard API is supported
        if (!navigator.clipboard) {
            console.warn('Clipboard API not supported. Using fallback method.');
            // Fallback method to copy text
            const textarea = document.createElement('textarea');
            textarea.value = gameUrl;
            textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    toast.success("Game link copied to clipboard!");
                } else {
                    toast.error("Failed to copy the game link.");
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                toast.error("Failed to copy the game link.");
            }

            document.body.removeChild(textarea);
            return;
        }

        try {
            // Check clipboard-write permission status
            const permissionStatus = await navigator.permissions.query({name: 'clipboard-write' as PermissionName});

            if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
                // Attempt to write to clipboard
                await navigator.clipboard.writeText(gameUrl);
                toast.success("Game link copied to clipboard!");
            } else if (permissionStatus.state === 'denied') {
                // Permission denied
                toast.error("Clipboard access denied. Please allow clipboard permissions and try again.");
            }
        } catch (error) {
            console.error('Error checking clipboard permissions or writing to clipboard:', error);
            toast.error("Failed to copy the game link.");
        }
    };

    return (
        <div className="h-auto flex-col flex items-start justify-center">
            {game ? (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="p-6 md:p-10 rounded-lg w-full max-w-3xl mx-auto space-y-8 "
                >
                    <div className="text-center">
                        <h1 className="md:text-4xl text-3xl font-bold text-gray-200 mb-4">Game Lobby</h1>
                        <div
                            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                                <span className="font-mono text-2xl tracking-widest">{game.code}</span>
                                <button
                                    onClick={handleCopyGameCode}
                                    className="text-cyan-500 hover:text-cyan-400 focus:outline-none"
                                    title="Copy Game Link"
                                >
                                    <FaCopy size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <JoinedPlayers onKickPlayer={kickPlayer}/>
                    </div>

                    {player?._id === game.creatorId && (
                        <div className="flex justify-center mt-8">
                            <Button
                                onClick={handleStartGame}
                                loading={starting}
                                className="bg-green-500 hover:bg-green-600 text-xl flex items-center space-x-2"
                            >
                                <FaGamepad size={24}/>
                                <span>{starting ? "Starting Game..." : "Start Game"}</span>
                            </Button>
                        </div>
                    )}

                </motion.div>

            ) : (
                <p className="text-white text-center text-2xl">Waiting for game details...</p>
            )}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className={"p-4 flex items-center justify-center w-full bottom-20 left-0"}>
                <Quote/>
            </motion.div>
        </div>
    );
};

export default Lobby;
