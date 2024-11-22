import React, {useEffect, useState} from "react";
import BubbleMessage from "./BubbleMessage";
import {Socket} from "socket.io-client";

interface BubbleMessageData {
    id: string;
    sender: string;
    message: string;
    position: { x: number; y: number };
    expiry: number;
}

interface BubbleMessengerProps {
    socket: Socket;
}

let bubbleIdCounter = 0; // Unique ID counter

const BubbleMessenger: React.FC<BubbleMessengerProps> = ({socket}) => {
    const [bubbles, setBubbles] = useState<BubbleMessageData[]>([]);

    useEffect(() => {
        if (socket) {
            socket.on("player:message", (data: { playerName: string; message: string }) => {
                addBubble(data.playerName, data.message);
            });

            return () => {
                socket.off("player:message");
            };
        }
    }, [socket]);

    const addBubble = (sender: string, message: string) => {
        const id = (++bubbleIdCounter).toString(); // Generate unique bubble ID
        const position = {
            x: Math.random() * (window.innerWidth - 300),
            y: Math.random() * (window.innerHeight - 50),
        };
        const expiry = Date.now() + 5000; // Bubble should expire in 5 seconds
        setBubbles((prev) => [...prev, {id, sender, message, position, expiry}]);
    };

    // Remove bubble by ID
    const removeBubble = (id: string) => {
        setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
    };

    return (
        <div>
            {bubbles.map((bubble) => (
                <BubbleMessage
                    key={bubble.id}
                    id={bubble.id}
                    sender={bubble.sender}
                    message={bubble.message}
                    position={bubble.position}
                    expiry={bubble.expiry}
                    onRemove={removeBubble}
                />
            ))}
        </div>
    );
};

export default BubbleMessenger;
