// GameCreator.tsx

import {FC, useState} from "react";
import {motion} from "framer-motion";
import QuestionTypeSelector from "./QuestionTypeSelector";
import TimerSelector from "./TimerSelector";
import Slider from "./Slider";
import toast from "react-hot-toast";
import {GameModeType, GameSettings} from "../../../types"; // Ensure GameModeType is imported
import {usePlayer} from "../../../contexts/playerProvider";
import Button from "../../Button";
import CollapsibleSection from "../../CollapsibleSection.tsx";
import {FaGamepad} from "react-icons/fa";

const GameCreator: FC = () => {
    const {createGame} = usePlayer(); // Use socket context for game creation
    const [creating, setCreating] = useState(false); // Loading state for form submission

    // State for game settings
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        numberOfRounds: 10,
        gameModes: [
            /*"multiple-choice",
            "what-would-you-rather",
            "who-would-rather",
            "ranking",
            "hide-and-seek",
            "memory",
            "sequence-memory", "word-scramble",
            "code-breaker",*/
            "spy"

        ] as GameModeType[],
        timeLimit: 30,
        punishmentMultiplier: 1,
    });

    // Handlers for updating game settings
    const handleQuestionsChange = (value: number) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            numberOfRounds: value,
        }));
    };

    const handleMultiplierChange = (value: number) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            punishmentMultiplier: value,
        }));
    };

    const handleGameModesChange = (selectedTypes: GameModeType[]) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            gameModes: selectedTypes,
        }));
    };

    const handleTimeLimitChange = (timeLimit: number) => {
        setGameSettings((prevSettings) => ({...prevSettings, timeLimit}));
    };

    const handleSubmit = async () => {
        if (gameSettings.gameModes.length === 0) {
            toast.error("Please select at least one game mode.");
            return; // Prevent submission if no game modes are selected
        }

        setCreating(true); // Show loading state
        const result = await createGame(gameSettings);

        if (result.success) {
            toast.success("Game created successfully!");
            console.log("Game created:", result.data); // Transition to the lobby or show the game code
            // Optionally, redirect to the game lobby or another page
        } else {
            toast.error(result.error || "Failed to create game.");
            setCreating(false); // Remove loading state
        }
    };

    const getThumbIcon = (value: number) => {
        switch (value) {
            case 1:
                return "🥱";
            case 2:
                return "😬";
            case 3:
                return "😅";
            case 4:
                return "🫠";
            case 5:
                return "💀";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-cyan-500 text-gray-200 p-6 w-full">
            <h2 className="md:text-4xl text-2xl font-bold mb-6 text-center">
                Create a New Game
            </h2>

            {/* Animated Settings Container */}
            <motion.div
                className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-8"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
            >
                <CollapsibleSection title={`Numbers of Rounds: ${gameSettings.numberOfRounds}`}>
                {/* Sliders & Selectors */}
                    <motion.div
                        className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                    >
                        <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={gameSettings.numberOfRounds}
                            onChange={handleQuestionsChange}
                        />
                    </motion.div>
                </CollapsibleSection>
                <CollapsibleSection title={`Punishment multiplier ${gameSettings.punishmentMultiplier}x`}>

                    <motion.div
                        className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.1}}
                    >
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            thumbIcon={getThumbIcon(gameSettings.punishmentMultiplier)}
                            value={gameSettings.punishmentMultiplier}
                            onChange={handleMultiplierChange}
                        />
                    </motion.div>
                </CollapsibleSection>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                >
                    <CollapsibleSection title={`Time Limit: ${gameSettings.timeLimit}s`}>
                        <motion.div
                            className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                        >
                            <TimerSelector
                                timeLimit={gameSettings.timeLimit}
                                onChange={handleTimeLimitChange}
                            />
                        </motion.div>
                    </CollapsibleSection>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                >
                    <CollapsibleSection title="Select Game Modes">
                        {/* Game Mode Selector */}
                        <motion.div
                            className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                        >
                            <QuestionTypeSelector
                                selectedTypes={gameSettings.gameModes}
                                onChange={handleGameModesChange}
                            />
                        </motion.div>
                    </CollapsibleSection>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                    className="flex justify-center mt-8"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.5}}
                >
                    <Button
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 gap-2 text-xl flex items-center space-x-2"
                        disabled={creating}
                    >
                        <FaGamepad size={24}/>
                        {creating ? "Creating Game..." : "Create Game"}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default GameCreator;
