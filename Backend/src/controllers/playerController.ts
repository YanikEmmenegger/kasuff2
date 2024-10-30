import Player, {IPlayer} from '../models/Player';
import {OperationResult} from '../types';
import Game, {IAnswer, IGame} from "../models/Game";
import {gameTimers, handleResults} from "./gameController";

/**
 * Fetch a player by their MongoDB _id.
 */
export const getPlayerById = async (id: string): Promise<OperationResult<IPlayer>> => {
    try {
        const player = await Player.findById(id);

        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        return {success: true, data: player};
    } catch (error) {
        console.error('[ERROR] Fetching player by ID:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Create a new player with optional avatar and socketId.
 * Validates avatar structure before saving.
 */
export const createPlayer = async (name: string, avatar?: Record<string, any>, socketId?: string): Promise<OperationResult<IPlayer>> => {
    try {
        // Since the avatar structure is now flexible, no validation is required
        const newPlayer = new Player({
            name,
            avatar: avatar || null, // Assign the avatar if provided, otherwise default to null
            socketId: socketId || '' // Default to an empty string if no socketId is provided
        });

        await newPlayer.save();

        console.log(`[PLAYER] New player created: ${newPlayer._id}`);
        return {success: true, data: newPlayer};
    } catch (error) {
        console.error('[ERROR] Creating player:', error);
        return {success: false, error: 'Internal server error.'};
    }
};
/**
 * Handle player reconnection and return the game state if the player is in a game.
 */
export const handlePlayerReconnect = async (playerId: string, socketId: string): Promise<OperationResult<{
    player: IPlayer,
    game?: IGame,
}>> => {
    try {
        console.log(`[RECONNECT] Player ${playerId} is reconnecting.`);
        const player = await Player.findById(playerId);

        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        // Update player's socketId
        player.socketId = socketId;
        await player.save();

        if (player.gameCode) {
            console.log(`[RECONNECT] Player ${playerId} is in game ${player.gameCode}, fetching game state.`);
            const game = await Game.findOne({code: player.gameCode, isActive: true})
                .populate('players', 'name avatar points')
                .populate('questions', 'question category');

            if (!game) {
                // Player's game is no longer active, clear gameCode
                player.gameCode = undefined;
                await player.save();
                return {success: true, data: {player}};
            }

            return {success: true, data: {player, game}};
        }

        return {success: true, data: {player}};
    } catch (error) {
        console.error('[ERROR] Handling player reconnection:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

/**
 * Update player details including name, avatar, gameCode, socketId, and points.
 */
export const updatePlayer = async (
    id: string,
    updateData: Partial<{
        name: string;
        avatar: Record<string, any>;
        gameCode: string;
        socketId: string;
        points: number
    }>
): Promise<OperationResult<IPlayer>> => {
    try {
        const player = await Player.findById(id);

        if (!player) {
            return {success: false, error: 'Player not found.'};
        }

        // Update name if provided
        if (updateData.name) {
            player.name = updateData.name;
        }

        // Update avatar if provided, no validation is required for specific fields
        if (updateData.avatar) {
            player.avatar = updateData.avatar;
        }

        // Update gameCode if provided
        if (updateData.gameCode) {
            player.gameCode = updateData.gameCode;
        }

        // Update socketId if provided
        if (updateData.socketId) {
            player.socketId = updateData.socketId;
        }

        // Update points if provided
        if (typeof updateData.points === 'number') {
            player.points = updateData.points;
        }

        await player.save();

        console.log(`[PLAYER] Player ${id} updated.`);
        return {success: true, data: player};
    } catch (error) {
        console.error('[ERROR] Updating player:', error);
        return {success: false, error: 'Internal server error.'};
    }
};

export const playerAnswered = async (gameCode: string, answer: IAnswer, io: any): Promise<OperationResult<IGame>> => {
    try {
        // Find the game by code and ensure it's active
        const game = await Game.findOne({code: gameCode, isActive: true});

        if (!game) {
            return {success: false, error: 'Game not found.'};
        }

        // Check if the player has already answered
        const playerAnswered = game.playersAnswered.find(playerId => playerId.toString() === answer.playerId.toString());
        if (playerAnswered) {
            return {success: false, error: 'Player has already answered.'};
        }

        // Mark player as having answered
        game.playersAnswered.push(answer.playerId);
        answer.answeredAt = new Date();

        // Ensure the answers array for the current question exists
        if (!game.answers[game.currentQuestionIndex]) {
            game.answers[game.currentQuestionIndex] = [];
        }

        // Push the answer to the answers array for the current question
        game.answers[game.currentQuestionIndex].push(answer);


        // Save the updated game state
        await game.save();
        // Check if all players have answered
        if (game.playersAnswered.length === game.players.length) {

            // Clear the active timer if it exists
            if (gameTimers[gameCode]) {
                clearTimeout(gameTimers[gameCode]);
                delete gameTimers[gameCode]; // Remove the timer from storage
                console.log(`[GAME] Timer for game ${gameCode} cleared because all players answered.`);
            }


            setTimeout(async () => {
                // Transition logic or other actions can be placed here if needed later
                console.log('All players have answered.');
                await handleResults(gameCode, io);
            }, 1000);

        }

        return {success: true, data: game};
    } catch (error) {
        console.error('[ERROR] Updating player:', error);
        return {success: false, error: 'Internal server error.'};
    }
};
// Define arrays of adjectives and nouns
const adjectives = [
    "Silly", "Funky", "Wacky", "Goofy", "Crazy", "Zany", "Cheeky", "Lazy", "Grumpy", "Jolly",
    "Fat", "Dumb", "Flipping", "Sloppy", "Drunky", "Slurring", "Tipsy", "Wasted", "Sleepy",
    "Clumsy", "Stupid", "Brainless", "Dopey", "Useless", "Clueless", "Drooling", "Sweaty",
    "Ludicrous", "Imbecilic", "Moronic", "Buffoonish", "Dim-witted", "Absurd", "Ignorant",
    "Delirious", "Scatterbrained", "Deranged", "Knuckleheaded", "Obtuse", "Gibbering", "Pathetic",
    "Miserable", "Foul-mouthed", "Ass-faced", "Piss-drunk", "Booze-soaked", "Shit-talking",
    "Knob-headed", "Cocky", "Dick-brained", "Bastardized", "Throbbing", "Lusty", "Horny",
    "Filthy", "Perverted", "Randy", "Greasy", "Moaning", "Humping", "Thrusting",
    "Groping", "Slutty", "Naughty", "Sleazy"
];

const nouns = [
    "FuckFace","Banana", "Monkey", "Unicorn", "Nonce", "Wanker", "Ass", "Wanker", "Cunt", "Bastard", "Douche", "Dickhead", "Knobhead", "Shithead",
    "Pisshead", "Twit", "Prick", "Tosser", "Wanker", "Arsehole", "Scumbag", "Cockwomble", "Bellend",
    "Fucker", "Dipshit", "Jackass", "Fuckwit", "KnobJockey", "Asswipe", "Twat", "Pisspot", "Dumbass",
    "Loser", "Idiot", "Douchebag", "FartSniffer", "Butthead", "Shitbag", "Cocksucker", "Slut",
    "Meathead", "Slag", "Slopbucket", "DickLicker", "CockLover", "AssLover", "TittyGrabber",
    "CockThrobber", "PussyMuncher", "AssEater", "FannyTickler", "NippleTwister", "BallJuggler",
    "PantySniffer", "TittySqueezer", "HardOn", "SmallDick", "WetDream", "Perv", "WankStain", "Splooge"
];

// Helper function to get a random element from an array
function getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
}

export const generateRandomUsername = (): string => {
    const adjective = getRandomElement(adjectives);
    const noun = getRandomElement(nouns);
    return `${adjective}${noun}`;
}
