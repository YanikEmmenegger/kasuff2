import express, {Application, Request, Response} from 'express';
import http from 'http';
import {Server as SocketIOServer} from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
    createGame,
    forceEndRound,
    joinGame,
    kickPlayer,
    leaveGame,
    loadNextQuestion,
    startGame
} from './controllers/gameController';
import {createPlayer, handlePlayerReconnect, playerAnswered, updatePlayer} from './controllers/playerController';
import {OperationResult} from './types';
import {IPlayer} from './models/Player';
import Game, {IAnswer, IGame, IGameSettings} from './models/Game';
import path from "node:path";
import {logVisitor} from "./middleware/logVisitors";
import visitorRoutes from "./routes/visitorRoutes";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import {generateRandomUsername} from "./utils/randomNames";
import rateLimit from "express-rate-limit";
import playerRoutes from "./routes/playerRoutes";
import gamesRoutes from "./routes/gamesRoutes";
import questionRoutes from "./routes/questionRoutes";


// Load environment variables
dotenv.config();

// Create an Express application
const app: Application = express();
const server = http.createServer(app);


const io = new SocketIOServer(server, {
    cors: {
        origin: ['https://kasuff.com', 'http://localhost:5173', "http://localhost:2608", "http://localhost:5173"], // Allowed origins
        methods: ['GET', 'POST'],
        credentials: false,
    },
    transports: ['websocket', 'polling'], // Allow both websocket and polling as transports
});


if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust only one layer of proxy, e.g., Nginx// Trust the first proxy
    const allowedOrigins = ['https://kasuff.com', 'https://www.kasuff.com', 'http://localhost', "http://localhost:5173"];
    console.log('CORS allowed origins:', allowedOrigins);
    app.use(
        cors({
            origin: function (origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                    return callback(new Error(msg), false);
                }
                return callback(null, true);
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        })
    );
// Socket.IO Admin UI (for monitoring during development)
//instrument(io, {auth: false, mode: 'development'});
    console.log('CORS enabled');
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000, // 10 minutes
        max: 300,
        limit: 300,
        message: 'Too many requests from this IP, please try again after 10 minutes',
        standardHeaders: true,
        legacyHeaders: false,
    });
    console.log('Rate limiter enabled');
    app.use(limiter);
    console.log('hsts Helmet enabled');
    app.use(
        helmet.hsts({
            maxAge: 63072000, // 2 years in seconds
            includeSubDomains: true,
            preload: true,
        })
    );
    console.log('xssFilter Helmet enabled');
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
                connectSrc: ["'self'", "https://kasuff.com", "wss://kasuff.com"], // Allow WebSocket connections
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        })
    );
} else {
    //set cors open for all
    app.use(cors(
        {
            origin: "*",
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }
    ));
}

app.use(cookieParser()); // Use cookie-parser middleware

app.use(logVisitor);
app.use(express.json()); // Parse JSON bodies

app.use('/api', visitorRoutes);
app.use('/api', playerRoutes);
app.use('/api', gamesRoutes);
app.use('/api', questionRoutes);

// Define the port (default to 5000 if not in environment)
const PORT: number =  2608;


// Serve static files from the Vite-built frontend
app.use(express.static(path.join(__dirname, '../public/')));

// Basic route to serve the built frontend
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// For all other routes, fallback to the index.html (this is important for client-side routing)
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


// Handle new socket connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Log all incoming socket events for debugging

    // Player reconnect handler
    socket.on('player:reconnect', async (data: { id: string }, callback: (result: OperationResult<{
        player: IPlayer,
        game?: IGame
    }>) => void) => {
        const {id} = data;
        try {
            const result = await handlePlayerReconnect(id, socket.id);
            if (result.success) {
                console.log(`Player ${id} reconnected with socket ${socket.id}`);
                callback(result);
                if (result.data?.game?.code) {
                    socket.join(result.data.game.code); // Rejoin the game room if applicable
                    console.log(`Player ${id} rejoined game ${result.data.game.code}`);
                }
            } else {
                console.error(result.error);
                callback({success: false, error: result.error});
            }
        } catch (error) {
            console.error('Error during player reconnect:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });
    // Player reconnect handler
    socket.on('player:message', async (data: { gameCode: string, message:string, playerName: string }) => {
        const {gameCode, message, playerName} = data;
        io.to(gameCode).emit('player:message', {message, playerName});
    });

    // Player creation handler
    socket.on('player:create', async (data: { avatar: any }, callback: (result: OperationResult<IPlayer>) => void) => {
        const randomName = generateRandomUsername();
        const {avatar} = data;
        try {
            const result = await createPlayer(randomName, avatar, socket.id);
            if (result.success) {
                console.log(`New player created: ${result.data?._id}`);
                callback(result);
            } else {
                console.error(result.error);
                callback(result);
            }
        } catch (error) {
            console.error('Error creating new player:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Player update handler
    socket.on('player:update', async (data: {
        id: string,
        name?: string,
        avatar?: any,
        gameCode?: string
    }, callback: (result: OperationResult<IPlayer>) => void) => {
        const {id, ...updateData} = data;
        try {
            const result = await updatePlayer(id, updateData);
            if (result.success) {
                console.log(`Player ${id} updated successfully.`);
                callback(result);
                if (result.data?.gameCode) {
                    socket.join(result.data.gameCode); // Join game room if gameCode exists
                }
            } else {
                console.error(result.error);
                callback(result);
            }
        } catch (error) {
            console.error('Error updating player:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Game creation handler
    socket.on('game:create', async (data: {
        creatorId: string,
        settings: IGameSettings
    }, callback: (result: OperationResult<IGame>) => void) => {
        const {creatorId, settings} = data;
        try {
            const gameOrError = await createGame(creatorId, settings);
            if (gameOrError.success) {
                socket.join(gameOrError.data!.code); // Join the game room
                console.log(`Player ${creatorId} created game ${gameOrError.data!.code}`);
                socket.emit('game:joined', gameOrError.data);
            }
            callback(gameOrError);
        } catch (error) {
            console.error('Error creating game:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Game creation handler
    socket.on('game:forceEndRound', async (data: {
        gameCode: string,
    }, callback: (result: OperationResult<boolean>) => void) => {
        try {
            const res = await forceEndRound(data.gameCode, io);

            if (!res) {
                return callback({
                    success: false,
                });
            }

            return callback({
                success: true,
                data: true
            });
        } catch (e) {
            return callback({
                success: false,
            });
        }
    });

    // Player join game handler
    socket.on('game:join', async (data: {
        gameCode: string,
        playerId: string
    }, callback: (result: OperationResult<IGame>) => void) => {
        const {gameCode, playerId} = data;
        try {
            const result = await joinGame(gameCode, playerId);
            if (result.success) {
                socket.join(gameCode); // Join the game room
                console.log(`Player ${playerId} joined game ${gameCode}`);
                socket.emit('game:joined', result.data);
                io.to(gameCode).emit('player:joined', result.data); // Notify other players
                callback(result);
            } else {
                console.error(result.error);
                callback(result);
            }
        } catch (error) {
            console.error('Error joining game:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Player leave game handler
    socket.on('game:leave', async (data: {
        gameCode: string,
        playerId: string
    }, callback: (result: OperationResult<IPlayer>) => void) => {
        const {gameCode, playerId} = data;
        try {
            const result = await leaveGame(gameCode, playerId);
            if (result.success) {
                socket.leave(gameCode); // Leave the game room
                console.log(`Player ${playerId} left game ${gameCode}`);
                io.to(gameCode).emit('player:left', {
                    playerName: result.data!.player.name,
                    game: result.data!.game,
                });
                callback({success: true, data: result.data!.player});
            } else {
                console.error(result.error);
                callback({success: false, error: result.error});
            }
        } catch (error) {
            console.error('Error leaving game:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Player kick handler
    socket.on('game:kick', async (data: {
        gameCode: string,
        playerId: string
    }, callback: (result: OperationResult<IGame>) => void) => {
        const {gameCode, playerId} = data;
        try {
            const result = await kickPlayer(gameCode, playerId);
            if (result.success) {
                const player = result.data!.kickedPlayer;
                const game = result.data!.game;
                const playerSocket = io.sockets.sockets.get(player.socketId);
                if (playerSocket) {
                    playerSocket.leave(gameCode); // Force player to leave room
                    playerSocket.emit('you:kicked', player);
                }
                console.log(`Player ${player._id} was kicked from game ${gameCode}`);
                socket.to(gameCode).emit('player:kicked', {playerName: player.name, game});
                callback({success: true, data: game});
            } else {
                console.error(result.error);
                callback({success: false, error: result.error});
            }
        } catch (error) {
            console.error('Error kicking player:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Game start handler
    socket.on('game:start', async (data: { gameCode: string }, callback: (result: OperationResult<IGame>) => void) => {
        const {gameCode} = data;
        try {
            const result = await startGame(gameCode, io);
            if (result.success) {
                console.log(`Game ${gameCode} started.`);
                io.to(gameCode).emit('game:state', {game: result.data}); // Notify all players
                callback(result);
            } else {
                console.error(result.error);
                callback(result);
            }
        } catch (error) {
            console.error('Error starting game:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Game start handler
    socket.on('game:next', async (data: { gameCode: string }, callback: (result: OperationResult<boolean>) => void) => {
        const {gameCode} = data;
        try {
            //set currentQuestionIndex
            const game = await Game.findOne({code: gameCode, isActive: true})
            if (!game) {
                return {success: false, error: 'Internal server error.'}
            }

            game.currentRoundIndex++
            await game.save()


            await loadNextQuestion(gameCode, io);
            return callback({
                success: true,
                data: true
            });
        } catch (error) {
            console.error('Error starting game:', error);
            callback({success: false, error: 'Internal server error.'});
        }
    });

    // Handle player answers (placeholder, implementation to be done)
    socket.on('player:answer', async (data: {
        answer: IAnswer,
        gameCode: string
    }, callback: (result: OperationResult<IGame>) => void) => {
        const {gameCode, answer} = data;


        try {
            const result = await playerAnswered(gameCode, answer, io)
            if (result.success) {
                console.log(`Player ${answer.playerId} answered question ${answer.answer}`);
                callback(result);
            } else {
                console.error(result.error);
                callback(result);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            callback({success: false, error: 'Internal server error.'});
        }

    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start the server and connect to MongoDB
const startServer = async () => {
    try {
        //log if dev or prod env
        console.log(`Environment: ${process.env.NODE_ENV}`);

        console.log('Connecting to MongoDB...');

        const mongoURI = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/kasuff2?authSource=admin';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process if DB connection fails
    }
};

// Start the server
startServer().catch((error) => console.error('Error starting server:', error));
