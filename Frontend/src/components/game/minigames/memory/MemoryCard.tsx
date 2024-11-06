import {FC} from "react";
import {motion} from "framer-motion";

interface CardType {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface CardProps {
    card: CardType;
    onClick: () => void;
    isWaiting: boolean;
    isGameCompleted: boolean; // New prop to trigger animation
    randomDelay: number; // New prop for random delay
}

const MemoryCard: FC<CardProps> = ({card, onClick, isWaiting, isGameCompleted, randomDelay}) => {
    const cardVariants = {
        initial: {y: 0, opacity: 1},
        gameCompleted: {
            y: 1000, // Cards fall down
            opacity: 0,
            transition: {
                duration: 1,
                delay: randomDelay, // Use the random delay for each card
            },
        },
    };

    return (
        <motion.div
            className={`mx-auto relative w-24 h-24 md:w-32 md:h-32 ${
                isWaiting ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={onClick}
            style={{perspective: 600}}
            variants={cardVariants}
            initial="initial"
            animate={isGameCompleted ? "gameCompleted" : "initial"}
        >
            <motion.div
                className="absolute inset-0"
                style={{transformStyle: "preserve-3d"}}
                animate={{rotateY: card.isFlipped || card.isMatched ? 0 : 180}}
                transition={{duration: 0.5}}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 flex items-center justify-center bg-cyan-600 text-white font-bold text-4xl rounded-md"
                    style={{backfaceVisibility: "hidden"}}
                >
                    {card.value}
                </div>
                {/* Back Side */}
                <div
                    className="absolute inset-0 flex items-center justify-center bg-cyan-600 rounded-md"
                    style={{backfaceVisibility: "hidden", transform: "rotateY(180deg)"}}
                >
                    {/* Card Back Design */}
                    <span className="text-2xl text-white">{isGameCompleted ? "": "❓"}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MemoryCard;
