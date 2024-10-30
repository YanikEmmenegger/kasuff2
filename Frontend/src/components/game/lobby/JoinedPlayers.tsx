import React, {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {usePlayer} from "../../../contexts/playerProvider";
import Button from "../../Button";
import {FaCrown, FaTimesCircle, FaUserCircle} from "react-icons/fa";

interface JoinedPlayersProps {
    onKickPlayer: (playerId: string) => void;
}

const JoinedPlayers: React.FC<JoinedPlayersProps> = ({onKickPlayer}) => {
    const {game, player} = usePlayer();
    const [playerToKick, setPlayerToKick] = useState<string | null>(null);

    if (!game) {
        return <p className="text-white text-center">No players joined yet.</p>;
    }

    const handleConfirmKick = () => {
        if (playerToKick) {
            onKickPlayer(playerToKick);
            setPlayerToKick(null);
        }
    };

    const handleCancelKick = () => {
        setPlayerToKick(null);
    };

    return (
        <div className="w-full">
            <ul className="text-white flex flex-wrap justify-center gap-6">
                <AnimatePresence>
                    {game.players.map((p) => {
                        const isCurrentPlayer = player?._id === p._id;
                        const isHost = p._id === game.creatorId;
                        const role = isHost ? "Host" : "Player";

                        return (
                            <motion.li
                                key={p._id}
                                initial={{opacity: 0, y: -10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: 10}}
                                className="flex items-center py-4 px-6 rounded-lg shadow-lg bg-cyan-600 min-w-[250px]"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <FaUserCircle className="text-4xl text-cyan-600"/>
                                    {isHost && (
                                        <FaCrown className="absolute -top-2 -right-2"/>
                                    )}
                                </div>
                                {/* Player Info */}
                                <div className="flex flex-col ml-4">
                  <span className="text-lg font-bold flex items-center">
                    {p.name} {isCurrentPlayer && "(You)"}
                      {/* Kick Button */}
                      {player?._id === game.creatorId && !isCurrentPlayer && (
                          <button
                              className="ml-2 text-red-500 hover:text-red-600 focus:outline-none"
                              onClick={() => setPlayerToKick(p._id)}
                              title="Kick Player"
                          >
                              <FaTimesCircle size={18}/>
                          </button>
                      )}
                  </span>
                                    <span className="text-gray-200 text-sm">{role}</span>
                                </div>
                            </motion.li>
                        );
                    })}
                </AnimatePresence>
            </ul>

            {/* Confirmation Modal */}
            {playerToKick && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        className="bg-white rounded-lg p-6 w-full max-w-[75%]"
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            Confirm Kick
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to kick this player?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <Button
                                onClick={handleCancelKick}
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmKick}
                                className="bg-red-500 text-white hover:bg-red-600"
                            >
                                Kick
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default JoinedPlayers;
