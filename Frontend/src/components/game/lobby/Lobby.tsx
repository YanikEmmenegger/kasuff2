import React, {useEffect, useState} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import {useNavigate} from "react-router";
import {motion} from "framer-motion";
import JoinedPlayers from "./JoinedPlayers";
import Button from "../../Button";
import {FaCopy, FaGamepad} from "react-icons/fa";
import Quote from "../../Quote.tsx";
import toast from "react-hot-toast";
import Input from "../../Input.tsx";
import {BiSend} from "react-icons/bi";

const Lobby: React.FC = () => {
    const {game, socket, player, kickPlayer, startGame, sendMessage} = usePlayer();
    const [starting, setStarting] = useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState("");


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

    const handleCopyGameCode = async () => {
        if (!game) {
            toast.error("No game information available to copy.");
            return;
        }

        const srv = import.meta.env.DEV ? "http://localhost:5173" : window.location.origin;
        const gameUrl = `${srv}/game?state=join&code=${game.code}`;

        try {
            // Use the Clipboard API if available, but skip permissions check for Safari compatibility
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(gameUrl);
                toast.success("Game link copied to clipboard!");
            } else {
                toast.error("Failed to copy the game link.");
            }
        } catch (error) {
            console.warn("Clipboard API not supported or failed, using fallback method.", error);

            // Fallback method for Safari and unsupported browsers
            const textarea = document.createElement("textarea");
            textarea.value = gameUrl;
            textarea.style.position = "fixed"; // Avoid scrolling issues
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                document.execCommand("copy");
                toast.success("Game link copied to clipboard!");
            } catch (err) {
                console.error("Fallback copy failed:", err);
                toast.error("Failed to copy the game link.");
            }

            document.body.removeChild(textarea);
        }
    };


    const handleSendMessage = (message: string) => {
        return async (e: React.FormEvent) => {
            e.preventDefault();
            if (!message) {
                return;
            }
            sendMessage(message);
            setMessage("");
        }
    }

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

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className={"p-4 flex items-center justify-center w-full bottom-20 left-0"}>
                <form onSubmit={handleSendMessage(message)} className={"flex items-center justify-center"}>
                    <Input maxLength={35} value={message}
                           onChange={(e) => setMessage(e.target.value)} type={'text'} className={"bg-cyan-600"}
                           placeholder={"message"}/>
                    <Button><BiSend/></Button>
                </form>

            </motion.div>
        </div>
    );
};

export default Lobby;
