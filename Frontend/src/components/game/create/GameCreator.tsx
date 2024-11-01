import {FC, useState} from "react";
import {motion} from "framer-motion";
import QuestionTypeSelector from "./QuestionTypeSelector";
import TimerSelector from "./TimerSelector";
import Slider from "./Slider";
import toast from "react-hot-toast";
import {GameSettings} from "../../../types";
import {usePlayer} from "../../../contexts/playerProvider";
import Button from "../../Button";
import LabelWithValue from "../../LabelWithValue";
import CollapsibleSection from "../../CollapsibleSection.tsx";

const GameCreator: FC = () => {
    const {createGame} = usePlayer(); // Use socket context for game creation
    const [creating, setCreating] = useState(false); // Loading state for form submission

    // State for game settings
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        numberOfQuestions: 10,
        questionTypes: [
            "multiple-choice",
            "what-would-you-rather",
            "who-would-rather",
            "ranking",
        ],
        timeLimit: 30,
        punishmentMultiplier: 1,
    });

    // Handlers for updating game settings
    const handleQuestionsChange = (value: number) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            numberOfQuestions: value,
        }));
    };

    const handleMultiplierChange = (value: number) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            punishmentMultiplier: value,
        }));
    };

    const handleQuestionTypesChange = (
        selectedTypes: GameSettings["questionTypes"]
    ) => {
        setGameSettings((prevSettings) => ({
            ...prevSettings,
            questionTypes: selectedTypes,
        }));
    };

    const handleTimeLimitChange = (timeLimit: number) => {
        setGameSettings((prevSettings) => ({...prevSettings, timeLimit}));
    };

    const handleSubmit = async () => {
        if (gameSettings.questionTypes.length === 0) {
            toast.error("Please select at least one question type.");
            return; // Prevent submission if no question types are selected
        }

        setCreating(true); // Show loading state
        const result = await createGame(gameSettings);

        if (result.success) {
            toast.success("Game created successfully!");
            console.log("Game created:", result.data); // Transition to the lobby or show the game code
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
                transition={{duration: 0.6}}
            >
                {/* Sliders & Selectors */}
                <div className="flex flex-col space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">

                    <motion.div
                        className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg shadow-md"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                    >
                        <LabelWithValue
                            text="Number of Questions"
                            value={gameSettings.numberOfQuestions}
                        />
                        <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={gameSettings.numberOfQuestions}
                            onChange={handleQuestionsChange}
                        />
                    </motion.div>

                    <motion.div
                        className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg shadow-md"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.4}}
                    >
                        <LabelWithValue
                            text="Punishment Multiplier"
                            value={`${gameSettings.punishmentMultiplier}x`}
                        />
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            thumbIcon={getThumbIcon(gameSettings.punishmentMultiplier)}
                            value={gameSettings.punishmentMultiplier}
                            onChange={handleMultiplierChange}
                        />
                    </motion.div>
                </div>
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.8}}
                >
                    <CollapsibleSection title={"Time Limit (Seconds) " + `${gameSettings.timeLimit}s`}>
                        <motion.div
                            className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg "
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.6}}
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
                    transition={{delay: 0.8}}
                >
                    <CollapsibleSection title={"Select Game Types"}>

                        {/* Question Type Selector */}
                        <motion.div
                            className="flex flex-col justify-center items-center bg-cyan-600 p-4 rounded-lg "
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2}}
                        >
                            <QuestionTypeSelector
                                selectedTypes={gameSettings.questionTypes}
                                onChange={handleQuestionTypesChange}
                            />
                        </motion.div>
                    </CollapsibleSection>
                </motion.div>
                {/*<motion.div*/}
                {/*    initial={{opacity: 0, y: 20}}*/}
                {/*    animate={{opacity: 1, y: 0}}*/}
                {/*    transition={{delay: 1}}*/}
                {/*>*/}
                {/*    <CollapsibleSection title={"Type Specific settings (coming soon)"}>*/}
                {/*        <motion.div*/}
                {/*            className="flex h-32 justify-center mt-8"*/}
                {/*            initial={{opacity: 0, y: 20}}*/}
                {/*            animate={{opacity: 1, y: 0}}*/}
                {/*            transition={{delay: 0.2}}*/}
                {/*        >*/}
                {/*            to be added*/}
                {/*        </motion.div>*/}
                {/*    </CollapsibleSection>*/}
                {/*</motion.div>*/}
                {/* Submit Button */}
                <motion.div
                    className="flex justify-center mt-8"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 1}}
                >
                    <Button
                        onClick={handleSubmit}
                        className="bg-cyan-700 hover:bg-cyan-800 text-gray-200 px-6 py-3 rounded-lg font-semibold"
                    >
                        {creating ? "Creating Game..." : "Create Game"}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default GameCreator;
