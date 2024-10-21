// src/index.ts

import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // Update this with your frontend URL in production
        methods: ['GET', 'POST'],
    },
});

const PORT: number = parseInt(process.env.PORT as string, 10) || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to kasuff2 Backend!');
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    // Add your Socket.IO event handlers here
});

// Connect to MongoDB and Start Server
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
        process.exit(1);
    }
};

startServer();
