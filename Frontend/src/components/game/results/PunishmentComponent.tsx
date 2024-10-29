import {usePlayer} from "../../../contexts/playerProvider.tsx";
import {Punishment} from "../../../types.ts";

const PunishmentComponent = () => {
    const {game, player} = usePlayer();

    if (!game || !player) {
        return null; // If game or player data is not available, return nothing
    }

    const playerId = player._id; // Get the current player's ID
    const punishments: Punishment[] = game.punishments[game.currentQuestionIndex] || [];

    // Helper function to render the reasons
    const renderReasons = (reasons: string[]) => {
        return reasons.map((reason, index) => (
            <span key={index} className="block text-sm text-gray-500">
                {reason}
            </span>
        ));
    };

    // Function to format the player's name and highlight the current player
    const formatPlayerName = (punishmentPlayerId: string) => {
        const punishedPlayer = game.players.find(p => p._id === punishmentPlayerId);
        if (!punishedPlayer) return "Unknown";

        return punishmentPlayerId === playerId
            ? <span className="text-blue-500 font-bold">YOU</span>
            : punishedPlayer.name;
    };

    // Function to render each punishment entry
    const renderPunishment = (punishment: Punishment) => {
        // Only display punishments with either 'give' or 'take'
        if (!punishment.give && !punishment.take) {
            return null;
        }
        if (punishment.give === 0) punishment.give = undefined;
        if (punishment.take === 0) punishment.take = undefined;

        return (
            <div key={punishment.playerId} className="border rounded-md p-4 shadow-sm mb-4">
                <div className="text-lg font-semibold">
                    {formatPlayerName(punishment.playerId)}
                </div>
                {renderReasons(punishment.reasons)}
                {punishment.take && punishment.take > 0 && (
                    <div className="text-red-500 font-bold mt-2">
                        Drinks to take: {punishment.take}
                    </div>
                )}
                {punishment.give && punishment.give > 0 && (
                    <div className="text-green-500 font-bold mt-2">
                        Drinks to give: {punishment.give}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="px-8 py-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Punishments</h2>
            {punishments.length > 0 ? (
                <div>
                    {punishments
                        .filter(punishment => punishment.give || punishment.take) // Filter to only show punishments with give or take
                        .map(punishment => renderPunishment(punishment))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No punishments this round.
                </div>
            )}
        </div>
    );
};

export default PunishmentComponent;
