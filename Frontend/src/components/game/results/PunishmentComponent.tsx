import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import {Punishment} from "../../../types";
import {AnimatePresence, motion} from "framer-motion";
import Avatar from "../../avatar/Avatar.tsx";
import {defaultAvatarOptions} from "../../avatar/types/avatarType.ts";

const PunishmentComponent: React.FC = () => {
    const {game, player} = usePlayer();

    if (!game || !player) {
        return null; // If game or player data is not available, return nothing
    }

    const playerId = player._id; // Get the current player's ID
    const punishments: Punishment[] =
        game.punishments[game.currentRoundIndex] || [];

    // Helper function to render the reasons
    const renderReasons = (reasons: string[]) => {
        return reasons.map((reason, index) => (
            <span key={index} className="block text-sm text-gray-200">
        {reason}
      </span>
        ));
    };

    // Function to format the player's name
    const formatPlayerName = (punishmentPlayerId: string) => {
        const punishedPlayer = game.players.find(
            (p) => p._id === punishmentPlayerId
        );
        if (!punishedPlayer) return "Unknown";

        return punishedPlayer.name;
    };

    // Get Avatar
    const getAvatar = (playerId: string) => {
        const player = game.players.find((p) => p._id === playerId);
        if (player) {
            return player.avatar;
        }
        return defaultAvatarOptions;
    };

    // Function to render each punishment entry
    const renderPunishment = (punishment: Punishment) => {
        // Only display punishments with either 'give' or 'take'
        if (!punishment.give && !punishment.take) {
            return null;
        }

        if (punishment.give === 0) {
            punishment.give = undefined;
        }
        if (punishment.take === 0) {
            punishment.take = undefined;
        }

        return (
            <motion.div
                key={punishment.playerId}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                className={`border border-cyan-700 rounded-md p-4 shadow-md mb-4 ${
                    punishment.playerId === playerId ? "bg-cyan-800" : "bg-cyan-600"
                }`}
            >
                <div className="flex gap-2 items-center mb-2">
                    <Avatar size={50} options={getAvatar(punishment.playerId)!}/>
                    <div className={"flex-col items-center gap-0 justify-center"}>
                        <div className="text-lg font-semibold text-gray-200">
                        {formatPlayerName(punishment.playerId)}
                    </div>
                    {punishment.playerId === playerId && (
                        <span className="text-xs font-medium text-gray-200">
                      (That's you!)
                    </span>
                    )}
                    </div>
                </div>
                {renderReasons(punishment.reasons)}
                <div className="mt-2 flex flex-wrap gap-4">
                    {punishment.take && punishment.take > 0 && (
                        <div className="flex items-center text-red-300 font-bold">
                            🫵🏼 Take {punishment.take} drink
                            {punishment.take > 1 ? "s" : ""}
                        </div>
                    )}
                    {punishment.give && punishment.give > 0 && (
                        <div className="flex items-center text-green-300 font-bold">
                            🤩 Give {punishment.give} drink
                            {punishment.give > 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    // Sort punishments to place the current player's punishments first
    const sortedPunishments = punishments
        .filter((punishment) => punishment.give || punishment.take)
        .sort((a, b) => {
            if (a.playerId === playerId && b.playerId !== playerId) return -1;
            if (a.playerId !== playerId && b.playerId === playerId) return 1;
            return 0;
        });

    return (
        <div className="px-8 py-4 w-full mx-auto bg-cyan-500 h-auto">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-200">
                Punishments
            </h2>
            {sortedPunishments.length > 0 ? (
                <AnimatePresence>
                    {sortedPunishments.map((punishment) => renderPunishment(punishment))}
                </AnimatePresence>
            ) : (
                <div className="text-center text-gray-200">
                    No punishments this round.
                </div>
            )}
        </div>
    );
};

export default PunishmentComponent;
