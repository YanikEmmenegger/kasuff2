import React from "react";
import {usePlayer} from "../../../contexts/playerProvider";
import Button from "../../Button.tsx";

interface JoinedPlayersProps {
    onKickPlayer: (playerId: string) => void;
}

const JoinedPlayers: React.FC<JoinedPlayersProps> = ({onKickPlayer}) => {
    const {game, player} = usePlayer();

    if (!game) {
        return <p className="text-white text-center">No players joined yet.</p>;
    }

    return (
        <ul className="text-white flex flex-wrap justify-center gap-6">
            {game.players.map((p) => {
                const isCurrentPlayer = player?._id === p._id;
                const role = p._id === game.creatorId ? "Host" : "Player";

                return (
                    <li
                        key={p._id}
                        className="flex justify-between items-center py-4 px-6 bg-gray-700 rounded-lg shadow-lg min-w-[250px]"
                    >
                        <div className="flex flex-col">
                            <span className="text-lg font-bold">{p.name}</span>
                            <span className="text-gray-400 text-sm">
                                {role} {isCurrentPlayer && "(You)"}
                            </span>
                        </div>
                        {player?._id === game.creatorId && !isCurrentPlayer && (
                            <Button
                                className="bg-red-500 hover:bg-red-600 ml-4"
                                onClick={() => onKickPlayer(p._id)}
                            >
                                Kick!
                            </Button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default JoinedPlayers;
