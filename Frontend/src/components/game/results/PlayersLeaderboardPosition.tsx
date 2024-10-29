import {FC} from "react";

interface PlayerLeaderboardPositionProps {
    playerId?: string;
    leaderboard?: { playerId: string; totalPoints: number }[];
}

const PlayerLeaderboardPosition: FC<PlayerLeaderboardPositionProps> = ({playerId, leaderboard}) => {
    if (!playerId || !leaderboard) return null; // Return nothing if playerId or leaderboard is undefined

    const position = leaderboard.findIndex((entry) => entry.playerId === playerId) + 1;
    return <span>#{position}</span>;
};

export default PlayerLeaderboardPosition;
