import React, {createContext, useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Answer, Game, GameSettings, OperationResult, Player, Question} from '../types';
import {useNavigate} from 'react-router';
import toast from 'react-hot-toast';
import {AvatarOptions, defaultAvatarOptions} from "../components/avatar/avatarType.ts";

// Define the shape of the context
interface PlayerContextType {
    player: Player | null;
    updatePlayer: (updateData: Partial<{
        name: string;
        avatar: AvatarOptions;
        gameCode: string;
        socketId: string;
    }>) => Promise<boolean>;
    socket: Socket | null;
    game: Game | null;
    createGame: (settings: GameSettings) => Promise<OperationResult<Game>>;
    joinGame: (gameCode: string) => Promise<OperationResult<Game>>;
    leaveGame: () => Promise<boolean>;
    kickPlayer: (playerId: string) => Promise<boolean>;
    startGame: () => Promise<boolean>;
    sendAnswer: (answer: string | string[]) => Promise<boolean>;
    nextQuestion: () => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false); // New loading state for socket connection
    const navigate = useNavigate();

    // Initialize Socket.IO connection and load player from localStorage
    useEffect(() => {
        const newSocket = io(import.meta.env.DEV ? "http://localhost:2608" : window.location.host);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsSocketConnected(true); // Set socket connected state when connected
        });

        newSocket.on('disconnect', () => {
            setIsSocketConnected(false); // Handle disconnection
        });

        const localPlayer = localStorage.getItem('player');
        if (localPlayer && localPlayer !== 'undefined') {
            setPlayer(JSON.parse(localPlayer)); // Load player from localStorage if it exists
        }

        // Cleanup the socket connection when the component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Handle player creation and reconnection
    useEffect(() => {
        if (!socket) return;

        const createNewPlayer = () => {
            socket.emit('player:create', {avatar: defaultAvatarOptions}, (result: OperationResult<Player>) => {
                if (result.success) {
                    setPlayer(result.data!);
                    localStorage.setItem('player', JSON.stringify(result.data));
                } else {
                    console.error('[ERROR] Creating player:', result.error);
                }
            });
        };

        const reconnectPlayer = () => {
            if (!player) return createNewPlayer(); // Create new player if no player exists
            console.log('Reconnecting player:', player);
            socket.emit('player:reconnect', {id: player._id}, (result: OperationResult<{
                player: Player;
                game: Game | null;
            }>) => {
                if (result.success) {
                    const {player, game} = result.data!;
                    setPlayer(player);
                    localStorage.setItem('player', JSON.stringify(player));

                    if (game) {
                        // Check if user already answered if state is quiz
                        if (game.state === 'quiz' && game.playersAnswered.includes(player!._id)) {
                            // set game from response but manipulate state into 'waiting'
                            setGame(
                                {
                                    ...game, state: 'waiting'
                                }
                            )
                            navigate(`/game?state=waiting`);
                        } else {
                            setGame(game);
                            navigate(`/game?state=${game.state}`);
                        }
                    }
                } else {
                    console.error('[ERROR] Reconnecting player:', result.error);
                    createNewPlayer(); // Create new player if reconnection fails
                }
            });
        };

        reconnectPlayer(); // Try to reconnect or create a new player
    }, [socket]);

    // Listen for various socket events related to the game and players
    useEffect(() => {
        if (!socket) return;

        // Log any socket event for debugging
        socket.onAny((eventName, ...args) => {
            console.debug(`[SOCKET EVENT] ${eventName}:`, ...args);
        });

        socket.on('game:joined', (game: Game) => {
            setGame(game);
            navigate(`/game?state=lobby&code=${game.code}`);
        });

        socket.on('player:joined', (game: Game) => {
            setGame(game);
        });

        socket.on('game:update', (game: Game) => {
            setGame(game);
        });

        socket.on('player:left', (response: { playerName: string; game: Game }) => {
            toast(`${response.playerName} left the game`, {icon: '👋'});
            if (game?.state !== 'quiz') setGame(response.game); // Only update game state if not in a quiz
        });

        socket.on('player:kicked', (response: { playerName: string; game: Game }) => {
            toast(`${response.playerName} has been kicked`, {icon: '👢'});
            setGame(response.game);
        });

        socket.on('you:kicked', (player: Player) => {
            toast('You have been kicked from the game', {icon: '👢'});
            setGame(null);
            setPlayer(player);
            navigate('/game?state=join');
        });

        // Handle game state changes
        socket.on('game:state', (response: { game: Game; question?: Question }) => {
            console.log('Game state:', response);

            // Check if user already answered if state is quiz
            if (response.game.state === 'quiz' && response.game.playersAnswered.includes(player!._id)) {
                // set game from response but manipulate state into 'waiting'
                setGame(
                    {
                        ...response.game, state: 'waiting'
                    }
                )
                navigate(`/game?state=waiting`);
            } else {
                setGame(response.game);
                navigate(`/game?state=${response.game.state}`);
            }
        });
    }, [socket, navigate]);

    // Update player data and sync with the server
    const updatePlayer = async (updateData: Partial<{
        name: string;
        avatar: AvatarOptions;
        gameCode: string;
        socketId: string
    }>) => {
        if (!player || !socket) return false;

        return new Promise<boolean>((resolve, reject) => {
            socket.emit('player:update', {id: player._id, ...updateData}, (result: OperationResult<Player>) => {
                if (result.success) {
                    setPlayer(result.data!);
                    localStorage.setItem('player', JSON.stringify(result.data!));
                    resolve(true);
                } else {
                    console.error('[ERROR] Updating player:', result.error);
                    reject(new Error(result.error || 'Failed to update player.'));
                }
            });
        });
    };

    // Create a new game
    const createGame = (settings: GameSettings) => {
        return new Promise<OperationResult<Game>>((resolve, reject) => {
            if (!player || !socket) return reject(new Error('Player or socket not found'));

            socket.emit('game:create', {creatorId: player._id, settings}, (result: OperationResult<Game>) => {
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.error || 'Failed to create game.'));
                }
            });
        });
    };

    // Join an existing game
    const joinGame = (gameCode: string) => {
        return new Promise<OperationResult<Game>>((resolve, reject) => {
            if (!player || !socket) return reject(new Error('Player or socket not found'));

            socket.emit('game:join', {playerId: player._id, gameCode}, (result: OperationResult<Game>) => {
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.error || 'Failed to join game.'));
                }
            });
        });
    };

    // Leave the current game
    const leaveGame = () => {
        return new Promise<boolean>((resolve, reject) => {
            if (!player || !socket || !game) return reject(new Error('Player, socket, or game not available'));

            socket.emit('game:leave', {playerId: player._id, gameCode: game.code}, (result: boolean) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Failed to leave game.'));
                }
            });
        });
    };

    // Kick a player from the game
    const kickPlayer = (playerId: string) => {
        return new Promise<boolean>((resolve, reject) => {
            if (!player || !socket || !game) return reject(new Error('Player, socket, or game not available'));

            socket.emit('game:kick', {playerId, gameCode: game.code}, (result: OperationResult<Game>) => {
                if (result.success) {
                    setGame(result.data!);
                    resolve(true);
                } else {
                    reject(new Error(result.error || 'Failed to kick player.'));
                }
            });
        });
    };

    // Start the game
    const startGame = () => {
        return new Promise<boolean>((resolve, reject) => {
            if (!player || !socket || !game) return reject(new Error('Player, socket, or game not available'));

            socket.emit('game:start', {gameCode: game.code}, (result: OperationResult<Game>) => {
                if (result.success) {
                    resolve(true);
                } else {
                    reject(new Error(result.error || 'Failed to start game.'));
                }
            });
        });
    };

    // Send answer
    const sendAnswer = (option: string | string[]) => {
        return new Promise<boolean>((resolve, reject) => {
            if (!player || !socket || !game) return reject(new Error('Player, socket, or game not available'));

            const answer: Answer = {
                playerId: player._id,
                questionId: game!.cleanedQuestions[game!.currentQuestionIndex]._id,
                answer: option,
            };

            socket.emit('player:answer', {answer, gameCode: game.code}, (result: OperationResult<Game>) => {
                if (result.success) {
                    resolve(true);
                    setGame({
                        ...result.data!,
                        //state: 'waiting',
                    });
                    navigate(`/game?state=waiting`);
                } else {
                    reject(new Error(result.error || 'Failed to submit answer.'));
                }
            });
        });
    };

    // next question please
    const nextQuestion = () => {
        return new Promise<boolean>((resolve, reject) => {
            if (!player || !socket || !game) return reject(new Error('Player, socket, or game not available'));

            socket.emit('game:next', {gameCode: game.code}, (result: OperationResult<Game>) => {
                if (result.success) {
                    resolve(true);
                } else {
                    reject(new Error(result.error || 'Failed to continue.'));
                }
            });
        });
    };

    // Render children only when socket is connected
    return (
        <PlayerContext.Provider
            value={{
                player,
                updatePlayer,
                socket,
                game,
                createGame,
                joinGame,
                leaveGame,
                kickPlayer,
                startGame,
                nextQuestion,
                sendAnswer,
            }}
        >
            {isSocketConnected ? children : <div className={"flex items-center -mt-20 flex-col-reverse justify-center"}>
                <img src="/_logo.png" alt="Loading..." className={"animate-pulse opacity-60 w-[60%]"}/>
            </div>} {/* Show loading until socket is connected */}
        </PlayerContext.Provider>
    );
};

// Hook to access player context
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};

export default PlayerProvider;
