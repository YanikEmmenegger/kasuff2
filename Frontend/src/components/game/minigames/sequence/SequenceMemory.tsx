import {useEffect, useRef, useState} from "react";
import Lamp from "./Lamp";
import {motion} from "framer-motion";
import {toast} from "react-hot-toast";
import {twMerge} from "tailwind-merge";
import {usePlayer} from "../../../../contexts/playerProvider.tsx";
import {SequenceMemoryGame} from "../../../../types.ts";

const SequenceMemory = () => {
    const lampColors = ["red", "green", "blue", "yellow", "purple", "pink", "sky", "orange", "indigo"];


    const {sendAnswer, game} = usePlayer(); // Uncomment if using sendAnswer

    const [sequence, setSequence] = useState<number[] | null>(null);
    const [lampsToDisplay, setLampsToDisplay] = useState<string[]>([]);


    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [isDisplayingSequence, setIsDisplayingSequence] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(-1); // Start with -1
    const [attempts, setAttempts] = useState(1); // Track failed attempts
    const [isGameCompleted, setIsGameCompleted] = useState(false); // New state

    const [timer, setTimer] = useState<number>(10); // Timer state

    const [canShowAgain, setCanShowAgain] = useState(false); // Controls "Show Again" button
    const timerTimeoutRef = useRef<number | null>(null); // Stores timeout ID for the countdown

    // Display sequence to the player on component mount
    useEffect(() => {

        if (sequence === null) {
            setSequence((game?.rounds[game.currentRoundIndex].data as SequenceMemoryGame).sequence);
            setLampsToDisplay(lampColors.slice(0, (game?.rounds[game.currentRoundIndex].data as SequenceMemoryGame).lamps));
        } else {
            setTimeout(() => displaySequence(), 1000);

            // Cleanup timer on unmount
            return () => {
                if (timerTimeoutRef.current !== null) {
                    clearTimeout(timerTimeoutRef.current);
                }
            };
        }


    }, [sequence]);

    const displaySequence = () => {
        setIsDisplayingSequence(true);
        setCanShowAgain(false); // Disable "Show Again" button

        // Reset timer to 10, but we do not start decrementing yet.
        setTimer(10);

        let i = 0;

        const showStep = () => {
            if (i < sequence!.length) {
                setCurrentStep(sequence![i]); // Highlight the current lamp
                setTimeout(() => {
                    setCurrentStep(-1); // Turn off the lamp
                    i++;
                    setTimeout(showStep, 200); // Delay between lamps
                }, 800); // Duration the lamp is lit
            } else {
                setIsDisplayingSequence(false);
                // Timer will start decrementing via useEffect
            }
        };

        showStep();
    };

    // Timer effect
    useEffect(() => {
        // Start the timer only after the sequence has been displayed
        if (!isDisplayingSequence && !isGameCompleted && !canShowAgain) {
            if (timer > 0) {
                timerTimeoutRef.current = window.setTimeout(() => {
                    setTimer(timer - 1);
                }, 1000);
            } else {
                setCanShowAgain(true);
            }
        }

        // Cleanup timeout when dependencies change
        return () => {
            if (timerTimeoutRef.current !== null) {
                clearTimeout(timerTimeoutRef.current);
                timerTimeoutRef.current = null;
            }
        };
    }, [timer, isDisplayingSequence, isGameCompleted, canShowAgain]);

    const handleLampClick = (index: number) => {
        if (isDisplayingSequence || isGameCompleted) return;

        const newPlayerSequence = [...playerSequence, index];
        setPlayerSequence(newPlayerSequence);

        // Check if the player's input matches the sequence so far
        const currentIndex = newPlayerSequence.length - 1;
        if (newPlayerSequence[currentIndex] !== sequence![currentIndex]) {
            setAttempts(attempts + 1);
            setPlayerSequence([]);
            toast.error("Wrong sequence! Try again.");
        } else if (newPlayerSequence.length === sequence!.length) {
            // User completed the sequence correctly
            setIsGameCompleted(true);
            submitAnswer();
        }
    };

    const handleShowAgainClick = () => {
        if (canShowAgain) {
            displaySequence();
        }
    };

    const submitAnswer = async () => {
        // Uncomment and modify if using sendAnswer
        try {
            await toast.promise(sendAnswer(attempts), {
                loading: "Submitting",
                success: "You completed the Sequence 🥳",
                error: "Error submitting.",
            });
        } catch (error) {
            console.error("Error while submitting answer:", error);
        }
    };

    return (
        <div className="min-h-[90%] h-auto w-full flex flex-col items-center p-6 bg-cyan-500">
            {/* Title */}
            <motion.div
                className="flex justify-center items-center h-1/4 p-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6}}
            >
                <h2 className="md:text-4xl text-2xl font-bold text-center text-gray-200">
                    Watch the sequence and repeat it! 💭
                </h2>
            </motion.div>

            {/* Lamps */}
            <div className="grid grid-cols-3 justify-center items-center gap-4">
                {lampsToDisplay.map((color, index) => (
                    <Lamp
                        key={index}
                        color={color}
                        isActive={currentStep === index}
                        onClick={() => handleLampClick(index)}
                        disabled={isDisplayingSequence || isGameCompleted} // Disable when game is completed
                        isGameCompleted={isGameCompleted} // Pass the new prop
                    />
                ))}
            </div>

            {/* Show Again Button */}
            <button
                className={twMerge(
                    "mt-4 px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed",
                    isGameCompleted ? "hidden" : ""
                )}
                onClick={handleShowAgainClick}
                disabled={!canShowAgain || isGameCompleted || isDisplayingSequence}
            >
                {canShowAgain ? "Show Again" : `Show Again (${timer}s)`}
            </button>
        </div>
    );
};

export default SequenceMemory;
