import React, {useEffect, useState} from "react";
import {motion, Variants} from "framer-motion";

interface BubbleProps {
    id: string;
    sender: string;
    message: string;
    position: { x: number; y: number };
    expiry: number;
    onRemove: (id: string) => void;
}

const BubbleMessage: React.FC<BubbleProps> = ({id, sender, message, position, expiry, onRemove}) => {
    const [isExploding, setIsExploding] = useState(false);
    useEffect(() => {
        const timeLeft = expiry - Date.now();

        if (timeLeft <= 0) {
            // If time has already expired (shouldn't happen), remove immediately
            setIsExploding(true);
            const cleanupTimer = setTimeout(() => {
                onRemove(id);
            }, 1000);

            return () => clearTimeout(cleanupTimer);
        }

        const timer = setTimeout(() => {
            setIsExploding(true);
            const cleanupTimer = setTimeout(() => {
                onRemove(id);
            }, 1000); // Wait for explosion animation to finish before removing
            return () => clearTimeout(cleanupTimer);
        }, timeLeft);

        return () => clearTimeout(timer);
    }, [id, expiry, onRemove]);

    const bubbleVariants: Variants = {
        initial: {opacity: 0, scale: 0.1},
        animate: {
            opacity: 1,
            scale: 1,
            y: [0, -5, 0],
            transition: {
                y: {
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 5,
                    ease: "easeInOut",
                },

            },
        },
        explode: {
            opacity: 0,
            scale: [1, 1.2, 0],
            transition: {
                duration: 0.5,
            },
        },
    };

    const particleVariants: Variants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            transition: {duration: 1},
        },
    };

    return (
        <motion.div
            onClick={() => {
                setIsExploding(true);
                const cleanupTimer = setTimeout(() => {
                    onRemove(id);
                }, 1000);
                return () => clearTimeout(cleanupTimer);
            }
            }
            initial="initial"
            animate={!isExploding ? "animate" : "explode"}
            variants={bubbleVariants}
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                position: "absolute",
                zIndex: 1000,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`
            }}
            className="p-4 cursor-pointer text-white rounded-lg shadow-lg"
        >
            {/* Message Content */}
            {!isExploding && (
                <div className="flex min-w-36 flex-col items-start">
                    <div className={"font-bold font-lg"}>{message}</div>
                    <div className={"text-xs"}>{sender}</div>
                </div>
            )}

            {/* Particle Explosion */}
            {isExploding && (
                <div className="absolute inset-0 flex flex-wrap" style={{zIndex: 999}}>
                    {[...Array(15)].map((_, index) => (
                        <motion.div
                            key={index}
                            className="w-2 h-2 rounded-full bg-white"
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transformOrigin: "center",
                            }}
                            initial="hidden"
                            animate="visible"
                            variants={particleVariants}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default BubbleMessage;
