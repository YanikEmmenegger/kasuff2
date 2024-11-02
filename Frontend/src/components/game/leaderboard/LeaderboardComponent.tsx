import {FC, useEffect, useState} from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import PlayerCard from "./PlayerCard";
import Confetti from "react-confetti";
import SupportButton from "../../SupportButton.tsx";

const LeaderboardComponent: FC = () => {
    const {game, player} = usePlayer();
    const entryInterval = 1000; // milliseconds, adjust as needed

    if (!game || !player) {
        return null;
    }
    // Sort leaderboard by totalPoints in descending order
    const sortedLeaderboard = [...game.leaderboard].sort(
        (a, b) => b.totalPoints - a.totalPoints
    );

    // Prepare player entries from last to first
    const reversedLeaderboard = [...sortedLeaderboard].reverse();

    // Function to get player details by ID
    const getPlayerDetails = (playerId: string) => {
        return game.players.find((p) => p._id === playerId);
    };

    // Prepare player entries with delay
    const playerEntries = reversedLeaderboard.map((entry, index) => {
        const playerDetails = getPlayerDetails(entry.playerId);
        const position =
            sortedLeaderboard.findIndex((e) => e.playerId === entry.playerId) + 1;
        const isLastPlayer = position === sortedLeaderboard.length;
        const isTopThree = position <= 3;
        const delay = index * entryInterval;

        return {
            ...entry,
            name: playerDetails?.name,
            isLastPlayer,
            isTopThree,
            delay,
            position,
        };
    });

    // State to manage confetti
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showConfetti, setShowConfetti] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [confettiType, setConfettiType] = useState<"regular" | "shit" | null>(
        null
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [windowSize, setWindowSize] = useState({width: 0, height: 0});

    // Update window size for confetti
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setWindowSize({width: window.innerWidth, height: window.innerHeight});
        const handleResize = () => {
            setWindowSize({width: window.innerWidth, height: window.innerHeight});
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Trigger confetti after all players are displayed
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const totalDisplayTime =
            playerEntries.length * entryInterval + 500; // extra 500ms to ensure all animations are done

        const confettiTimeout = setTimeout(() => {
            // Check if current player is in top 3
            const isTopThree = playerEntries
                .filter((p) => p.isTopThree)
                .some((p) => p.playerId === player?._id);

            const isLastPlayer = playerEntries
                .filter((p) => p.isLastPlayer)
                .some((p) => p.playerId === player?._id);

            if (isTopThree) {
                setConfettiType("regular");
                setShowConfetti(true);
                setTimeout(() => {
                    setShowConfetti(false);
                }, 20000);
            } else if (isLastPlayer) {
                setConfettiType("shit");
                setShowConfetti(true);
                setTimeout(() => {
                    setShowConfetti(false);
                }, 20000);
            }
        }, totalDisplayTime);

        return () => clearTimeout(confettiTimeout);
    }, [playerEntries, entryInterval, player]);

    const drawShitConfetti = (ctx: CanvasRenderingContext2D) => {
        ctx.font = "20px Arial";
        ctx.fillText("💩", 0, 0); // Draw the emoji
    };

    return (
        <div className="w-full flex flex-col items-center bg-cyan-500 text-gray-200 p-8">
            {/* Confetti Effect */}
            {showConfetti && confettiType === "regular" && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={1000}
                />
            )}
            {/* "Shit" Confetti Effect */}
            {showConfetti && confettiType === "shit" && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={1000}
                    drawShape={drawShitConfetti}
                />
            )}

            {/* Leaderboard Heading */}
            <h2 className="text-4xl font-bold text-center ">Leaderboard</h2>
            <div className={"my-8"}>
                <SupportButton>
                    Click to upgrade your luck 😉
                </SupportButton>
            </div>

            {/* Player Cards */}
            <div className="w-full flex flex-col-reverse">
                {playerEntries.map((entry) => (
                    <PlayerCard
                        key={entry.playerId}
                        player={entry}
                        isCurrentUser={entry.playerId === player?._id}
                    />
                ))}

            </div>
        </div>
    );
};

export default LeaderboardComponent;
