import {FC} from "react";
import {motion} from "framer-motion";

interface PlayerEntry {
    playerId: string;
    totalPoints: number;
    name?: string;
    isLastPlayer: boolean;
    isTopThree: boolean;
    delay: number;
    position: number;
}

interface PlayerCardProps {
    player: PlayerEntry;
    isCurrentUser: boolean;
}

const PlayerCard: FC<PlayerCardProps> = ({player, isCurrentUser}) => {
    const cardVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {opacity: 1, y: 0},
    };

    const borderColor = player.isTopThree
        ? player.position === 1
            ? "border-yellow-500"
            : player.position === 2
                ? "border-gray-400"
                : "border-amber-700"
        : player.isLastPlayer
            ? "border-red-500"
            : "border-cyan-700";

    const textColor = player.isTopThree
        ? player.position === 1
            ? "text-yellow-500"
            : player.position === 2
                ? "text-gray-400"
                : "text-amber-700"
        : player.isLastPlayer
            ? "text-red-500"
            : "text-gray-200";

    const medalIcon = player.isTopThree
        ? player.position === 1
            ? "🥇"
            : player.position === 2
                ? "🥈"
                : "🥉"
        : player.isLastPlayer
            ? "💩"
            : "";

    return (
        <motion.div
            className={`p-4 rounded-lg border-2 flex justify-between items-center mb-4 bg-cyan-600 ${borderColor}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{duration: 0.8, delay: player.delay / 1000}}
        >
            <div className="flex items-center">
                {medalIcon && <span className="text-2xl mr-2">{medalIcon}</span>}
                <span className={`text-lg font-medium ${textColor}`}>
          #{player.position} {player.name}
                    {isCurrentUser && " (You)"}
        </span>
            </div>
            <span className={player.totalPoints > 0 ? "text-green-300" : "text-red-300"}>
        {player.totalPoints} Points
      </span>
        </motion.div>
    );
};

export default PlayerCard;
