import {FC} from "react";
import toast from "react-hot-toast";
import {usePlayer} from "../../../contexts/playerProvider";

interface QuizButtonsProps {
    text: string;
    option: string;
    color: string;
    index: number;
    disabled?: boolean;
    onAnswer: () => void;
}

const QuizButton: FC<QuizButtonsProps> = ({text, color, disabled, onAnswer, option}) => {

    const {sendAnswer} = usePlayer();

    // Handle the click event when an option is selected
    const handleOptionClick = async (option: string) => {
        if (disabled) return;

        // Trigger external onAnswer callback if necessary
        onAnswer();

        try {
            // Await the sendAnswer function to properly resolve or reject
            await toast.promise(sendAnswer(option), {
                loading: "Answering question...",
                success: "Answer submitted!",
                error: "Error submitting answer.",
            });
        } catch (error) {
            console.error('Error while submitting answer:', error);
        }
    };

    return (
        <button
            key={text}
            onClick={() => handleOptionClick(option)}
            className={`bg-${color}-500 text-white py-4 px-4 rounded-lg transition text-center text-xl hover:opacity-80 hover:scale-105` + (disabled ? " opacity-50 cursor-not-allowed" : "")}
        >
            {text}
        </button>
    );
};

export default QuizButton;
