import {FC, useEffect, useState} from "react";
import {motion} from "framer-motion";
import MemoryCard from "./MemoryCard";
import {usePlayer} from "../../../../contexts/playerProvider";
import {MemoryGame} from "../../../../types";
import toast from "react-hot-toast";

interface CardType {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
    randomDelay?: number; // New optional property
}

const Memory: FC = () => {
    const {game, sendAnswer} = usePlayer();

    const [cards, setCards] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isGameCompleted, setIsGameCompleted] = useState(false);

    const [tries, setTries] = useState(0);

    useEffect(() => {
        const symbols = (game?.rounds[game.currentRoundIndex].data as MemoryGame).pairs;
        setTries(0 - symbols.length);
        // Initialize cards
        const initialCards: CardType[] = [];
        symbols.forEach((symbol, index) => {
            const randomDelay = Math.random() * 0.1 + 0.1; // Random delay between 0.1 and 0.2 seconds
            initialCards.push({
                id: index * 2,
                value: symbol,
                isFlipped: false,
                isMatched: false,
                randomDelay,
            });
            initialCards.push({
                id: index * 2 + 1,
                value: symbol,
                isFlipped: false,
                isMatched: false,
                randomDelay,
            });
        });

        // Shuffle cards
        initialCards.sort(() => Math.random() - 0.5);
        setCards(initialCards);
    }, [game]);

    const handleCardClick = (index: number) => {
        if (isWaiting || cards[index].isFlipped || cards[index].isMatched) {
            return;
        }

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        if (selectedCards.length === 0) {
            setSelectedCards([index]);
        } else if (selectedCards.length === 1) {
            setSelectedCards([...selectedCards, index]);
            checkForMatch(selectedCards[0], index);
        }
    };

    const checkForMatch = (firstIndex: number, secondIndex: number) => {
        setTries(tries + 1);
        if (cards[firstIndex].value === cards[secondIndex].value) {
            // Match found
            const newCards = [...cards];
            newCards[firstIndex].isMatched = true;
            newCards[secondIndex].isMatched = true;
            setCards(newCards);
            setSelectedCards([]);
        } else {
            // Not a match, flip back after a delay
            setIsWaiting(true);
            setTimeout(() => {
                const newCards = [...cards];
                newCards[firstIndex].isFlipped = false;
                newCards[secondIndex].isFlipped = false;
                setCards(newCards);
                setSelectedCards([]);
                setIsWaiting(false);
            }, 500);
        }
    };

    const submitAnswer = async () => {
        try {
            // Await the sendAnswer function to properly resolve or reject
            await toast.promise(sendAnswer(tries), {
                loading: "Submitting answer...",
                success: "Answer submitted!",
                error: "Error submitting answer.",
            });
        } catch (error) {
            console.error("Error while submitting answer:", error);
        }
    };

    useEffect(() => {
        if (cards.length > 0 && cards.every((card) => card.isMatched)) {
            if (!isGameCompleted) {
                setTimeout(() => setIsGameCompleted(true), 500); // Delay the animation
                submitAnswer();
            }
        }
    }, [cards, isGameCompleted]);

    return (
        <div className="min-h-[90%] h-auto w-full flex flex-col p-6">
            {/* Title */}
            <motion.div
                className="flex justify-center items-center h-1/4 p-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6}}
            >
                <h2 className="md:text-4xl text-2xl font-bold text-center">Memory Game</h2>
            </motion.div>

            {/* Card Grid */}
            <motion.div
                className="flex-1 mx-auto w-full grid grid-cols-3 md:grid-cols-4 gap-4 justify-center items-center"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2, duration: 0.6}}
            >
                {cards.map((card, index) => (
                    <MemoryCard
                        key={card.id}
                        card={card}
                        onClick={() => handleCardClick(index)}
                        isWaiting={isWaiting}
                        isGameCompleted={isGameCompleted}
                        randomDelay={card.randomDelay!} // Pass the random delay
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default Memory;
