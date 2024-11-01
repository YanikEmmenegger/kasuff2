import {FC} from "react";
import {motion} from "framer-motion";
import Avatar from "../../avatar/Avatar.tsx";
import {usePlayer} from "../../../contexts/playerProvider.tsx";
import {defaultAvatarOptions} from "../../avatar/types/avatarType.ts";

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
    const {game} = usePlayer();


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

    const getAvatar = (playerId: string) => {
        if (!game) {
            return defaultAvatarOptions;
        }
        const player = game.players.find((p) => p._id === playerId);
        if (player) {
            return player.avatar;
        }
        return defaultAvatarOptions;
    };

    return (
        <motion.div
            className={`p-4 rounded-lg border-2 flex justify-between items-center mb-4 bg-cyan-600 ${borderColor}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{duration: 0.8, delay: player.delay / 1000}}
        >
            <div className="flex flex-1 items-center">
                {medalIcon && <span className="text-2xl mr-2">{medalIcon}</span>}
                <span className={`text-lg flex items-center font-medium ${textColor}`}>
                    <Avatar size={50} options={getAvatar(player.playerId)!}/>
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
