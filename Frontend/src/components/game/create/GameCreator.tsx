import {FC, useState} from "react";
import QuestionTypeSelector from "./QuestionTypeSelector";
import TimerSelector from "./TimerSelector";
import Slider from "./Slider";
import {HiOutlineEmojiHappy} from "react-icons/hi";
import {GiChiliPepper} from "react-icons/gi";
import toast from "react-hot-toast";
import {GameSettings} from "../../../types";
import {usePlayer} from "../../../contexts/playerProvider";
import Button from "../../Button";
import LabelWithValue from "../../LabelWithValue.tsx";

const GameCreator: FC = () => {
    const {createGame} = usePlayer(); // Use socket context for game creation
    const [creating, setCreating] = useState(false); // Loading state for form submission

    // State for game settings
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        numberOfQuestions: 10,
        questionTypes: ["multiple-choice", "ranking", "what-would-you-rather", "who-would-rather"],
        timeLimit: 30,
        punishmentMultiplier: 1,
    });

    // Handlers for updating game settings
    const handleQuestionsChange = (value: number) => {
        setGameSettings((prevSettings) => ({...prevSettings, numberOfQuestions: value}));
    };

    const handleMultiplierChange = (value: number) => {
        setGameSettings((prevSettings) => ({...prevSettings, punishmentMultiplier: value}));
    };

    const handleQuestionTypesChange = (selectedTypes: GameSettings["questionTypes"]) => {
        setGameSettings((prevSettings) => ({...prevSettings, questionTypes: selectedTypes}));
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

    return (
        <div className="p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-8 my-10">
            <h2 className="md:text-4xl text-2xl font-bold text-white mb-6 text-center">Create a New Game</h2>

            {/* Sliders & Selectors in a row when possible */}
            <div className="flex flex-col space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
                <div>
                    <LabelWithValue text="Number of Questions" value={gameSettings.numberOfQuestions}/>
                    <Slider
                        min={1}
                        max={50}
                        step={1}
                        value={gameSettings.numberOfQuestions}
                        onChange={handleQuestionsChange}
                    />
                </div>

                <div>
                    <LabelWithValue text="PunishmentComponent Multiplier" value={`${gameSettings.punishmentMultiplier}x`}/>
                    <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={gameSettings.punishmentMultiplier}
                        onChange={handleMultiplierChange}
                        startIcon={<HiOutlineEmojiHappy/>}
                        endIcon={<GiChiliPepper/>}
                    />
                </div>

                <div className="md:col-span-2">
                    <LabelWithValue text="Time Limit (Seconds)" value={`${gameSettings.timeLimit}s`}/>
                    <TimerSelector timeLimit={gameSettings.timeLimit} onChange={handleTimeLimitChange}/>
                </div>
            </div>

            {/* Question Type Selector */}
            <div className="mt-6">
                <QuestionTypeSelector
                    selectedTypes={gameSettings.questionTypes}
                    onChange={handleQuestionTypesChange}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
                <Button onClick={handleSubmit} className={"bg-blue-500 hover:bg-blue-700"}>
                    {creating ? "Creating Game..." : "Create Game"}
                </Button>
            </div>
        </div>
    );
};

export default GameCreator;
