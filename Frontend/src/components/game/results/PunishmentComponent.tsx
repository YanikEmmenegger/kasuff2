import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import {Punishment} from "../../../types";
import {AnimatePresence, motion} from "framer-motion";

const PunishmentComponent: React.FC = () => {
    const {game, player} = usePlayer();

    if (!game || !player) {
        return null; // If game or player data is not available, return nothing
    }

    const playerId = player._id; // Get the current player's ID
    const punishments: Punishment[] =
        game.punishments[game.currentQuestionIndex] || [];

    // Helper function to render the reasons
    const renderReasons = (reasons: string[]) => {
        return reasons.map((reason, index) => (
            <span key={index} className="block text-sm text-gray-200">
        {reason}
      </span>
        ));
    };

    // Function to format the player's name and highlight the current player
    const formatPlayerName = (punishmentPlayerId: string) => {
        const punishedPlayer = game.players.find(
            (p) => p._id === punishmentPlayerId
        );
        if (!punishedPlayer) return "Unknown";

        return punishedPlayer.name
    };

    // Function to render each punishment entry
    const renderPunishment = (punishment: Punishment) => {
        // Only display punishments with either 'give' or 'take'
        if (!punishment.give && !punishment.take) {
            return null;
        }

        return (
            <motion.div
                key={punishment.playerId}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
                className={`border border-cyan-700 rounded-md p-4 shadow-md mb-4 ${
                    punishment.playerId === playerId
                        ? "bg-cyan-600"
                        : "bg-cyan-700"
                }`}
            >
                <div className="flex items-center mb-2">
                    <div className="text-lg font-semibold flex-1 text-gray-200">
                        {formatPlayerName(punishment.playerId)}
                    </div>
                    {punishment.playerId === playerId && (
                        <span className="text-sm font-medium text-gray-200">
              (That's you!)
            </span>
                    )}
                </div>
                {renderReasons(punishment.reasons)}
                <div className="mt-2 flex flex-wrap gap-4">
                    {punishment.take && punishment.take > 0 && (
                        <div className="flex items-center text-red-300 font-bold">
                             🫵🏼 Take {punishment.take} drink{punishment.take > 1 ? "s" : ""}
                        </div>
                    )}
                    {punishment.give && punishment.give > 0 && (
                        <div className="flex items-center text-green-300 font-bold">
                            🤩 Give {punishment.give} drink{punishment.give > 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="px-8 py-4 w-full  mx-auto bg-cyan-500 h-auto">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-200">
                Punishments
            </h2>
            {punishments.length > 0  && punishments ? (
                <AnimatePresence>
                    {punishments
                        .filter((punishment) => punishment.give || punishment.take)
                        .map((punishment) => renderPunishment(punishment))}
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
