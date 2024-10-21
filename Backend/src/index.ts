// src/index.ts

import express, {Application, Request, Response} from 'express';
import http from 'http';
import {Server as SocketIOServer} from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import roomRoutes from './routes/rooms';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO (future integration)
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // Replace with your frontend URL in production for security
        methods: ['GET', 'POST'],
    },
});

// Define the port
const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to kasuff2 Backend!');
});

// Use Room Routes
app.use('/rooms', roomRoutes);

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
