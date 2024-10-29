import {FC, useEffect, useState} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import TopPlayerComponent from "./TopPlayerComponent";
import OtherPlayerComponent from "./OtherPlayerComponent";
import {motion} from "framer-motion";
import Confetti from "react-confetti";

const LeaderboardComponent: FC = () => {
    const {game, player} = usePlayer();
    const [showConfetti, setShowConfetti] = useState(false);
    const [showShitConfetti, setShowShitConfetti] = useState(false);

    if (!game) return <div>No game available.</div>;

    // Sort leaderboard by totalPoints in descending order
    const sortedLeaderboard = [...game.leaderboard].sort(
        (a, b) => b.totalPoints - a.totalPoints
    );

    // Get the top 3 players
    const topPlayers = sortedLeaderboard.slice(0, 3);
    // Get the rest of the players
    const otherPlayers = sortedLeaderboard.slice(3);

    // Function to get player details by ID
    const getPlayerDetails = (playerId: string) => {
        return game.players.find((p) => p._id === playerId);
    };

    // Handle confetti effect for winners and losers
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (topPlayers.find((p) => p.playerId === player?._id)) {
            // Confetti for top 3 players
            setShowConfetti(true);
            const confettiInterval = setInterval(() => {
                setShowConfetti((prev) => !prev);
            }, 10000);
            return () => clearInterval(confettiInterval);
        } else if (otherPlayers.find((p) => p.playerId === player?._id)) {
            // "Shit" confetti for other players
            setShowShitConfetti(true);
            const shitConfettiInterval = setInterval(() => {
                setShowShitConfetti((prev) => !prev);
            }, 6000);
            return () => clearInterval(shitConfettiInterval);
        }
    }, [topPlayers, otherPlayers, player]);

    // Custom function to draw shit emoji instead of confetti
    const drawShitConfetti = (ctx: CanvasRenderingContext2D) => {
        ctx.font = "30px Arial";
        ctx.fillText("💩", 0, 0); // Draw the emoji
    };

    return (
        <div className="h-auto w-full p-8 bg-gray-800 text-white space-y-6">
            {/* Confetti Effect for Winners */}
            {showConfetti && <Confetti/>}

            {/* "Shit" Confetti Effect for Losers */}
            {showShitConfetti && (
                <Confetti
                    drawShape={drawShitConfetti} // Custom drawShape for "shit" emoji
                />
            )}

            {/* Leaderboard Heading */}
            <h2 className="text-4xl font-bold text-center">Leaderboard</h2>

            {/* Podium Layout */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center"
                style={{
                    gridTemplateAreas: `
                    "first first"
                    "second third"
                    `
                }}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.8}}
            >
                {/* First Place */}
                <div style={{gridArea: "first"}}>
                    <TopPlayerComponent
                        position={1}
                        name={getPlayerDetails(topPlayers[0].playerId)?.name}
                        points={topPlayers[0].totalPoints}
                    />
                </div>

                {/* Second Place */}
                <div style={{gridArea: "second"}}>
                    <TopPlayerComponent
                        position={2}
                        name={getPlayerDetails(topPlayers[1]?.playerId)?.name}
                        points={topPlayers[1]?.totalPoints}
                    />
                </div>

                {/* Third Place */}
                <div style={{gridArea: "third"}}>
                    <TopPlayerComponent
                        position={3}
                        name={getPlayerDetails(topPlayers[2]?.playerId)?.name}
                        points={topPlayers[2]?.totalPoints}
                    />
                </div>
            </motion.div>

            {/* Separator Line */}
            <hr className="border-t-2 border-gray-700 my-6"/>

            {/* Other Players List */}
            {otherPlayers.length > 0 && (
                <motion.div
                    className="mt-6"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.8}}
                >
                    <h3 className="text-2xl font-semibold text-center mb-4">Other Players</h3>
                    <ul className="space-y-4">
                        {otherPlayers.map((entry, index) => {
                            const player = getPlayerDetails(entry.playerId);
                            return (
                                <OtherPlayerComponent
                                    key={entry.playerId}
                                    position={index + 4}
                                    name={player?.name}
                                    points={entry.totalPoints}
                                />
                            );
                        })}
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default LeaderboardComponent;
