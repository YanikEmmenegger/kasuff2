// src/index.ts

import express, {Application, Request, Response} from 'express';
import http from 'http';
import {Server as SocketIOServer} from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from "./swagger.json";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import gamesRouter from './routes/games';
import playersRouter from './routes/players';
import questionsRouter from './routes/questions';
//import {setSocketIO} from './controllers/gameController';
import Player, {IPlayer} from './models/Player'; // Import Player for Socket.IO
import rateLimit from 'express-rate-limit';
import morgan from "morgan";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // Replace with your frontend URL in production for security
        methods: ['GET', 'POST', "PUT", "DELETE"],
    },
});

// Apply rate limiting to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000000000000000, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(morgan('combined'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(limiter);

// Set Socket.IO instance in controllers
//setSocketIO(io);

// Define the port
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to kasuff2 Backend!');
});

// Use Game Routes
//app.use('/games', gamesRouter);

// Use Player Routes
app.use('/players', playersRouter);

// Use Question Routes
app.use('/questions', questionsRouter);

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Listen for 'register' event to associate socket with player UUID
    socket.on('register', async (data: { uuid: string }) => {
        const {uuid} = data;

        if (!uuid) {
            console.error('UUID not provided in register event.');
            return;
        }

        try {
            // Find the player by UUID
            const player: IPlayer | null = await Player.findOne({uuid});

            if (!player) {
                console.error(`Player with UUID ${uuid} not found.`);
                return;
            }

            // Update the player's socketId
            player.socketId = socket.id;
            await player.save();

            console.log(`Socket ID ${socket.id} associated with UUID ${uuid}.`);

            // If the player is in a game, join the Socket.IO room
            if (player.gameCode) {
                socket.join(player.gameCode);
                console.log(`Player ${uuid} joined game ${player.gameCode} via Socket.IO.`);
            }
        } catch (error) {
            console.error('Error associating socket with player:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);

        try {
            // Find the player by socketId
            const player: IPlayer | null = await Player.findOne({socketId: socket.id});

            if (player) {
                // Clear the socketId
                player.socketId = '';
                await player.save();

                console.log(`Cleared socket ID for UUID ${player.uuid}.`);
            }
        } catch (error) {
            console.error('Error handling disconnection:', error);
        }
    });

    // Additional Socket.IO event handlers can be added here
});

// Socket.IO Connection Handler (To be implemented later)
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    // Additional Socket.IO event handlers will go here
});

// Function to start the server
const startServer = async () => {
    try {
        const mongoURI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/kasuff2';
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process with failure
    }
};

// Start the server
startServer();
