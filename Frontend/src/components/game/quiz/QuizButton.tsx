import {FC} from "react";
import {motion} from "framer-motion";
import toast from "react-hot-toast";
import {usePlayer} from "../../../contexts/playerProvider";

interface QuizButtonProps {
    text: string;
    option: string;
    color: string;
    index: number;
    disabled?: boolean;
    onAnswer: () => void;
}

const QuizButton: FC<QuizButtonProps> = ({
                                             text,
                                             color,
                                             disabled,
                                             onAnswer,
                                             option,
                                         }) => {
    const {sendAnswer} = usePlayer();

    // Handle the click event when an option is selected
    const handleOptionClick = async (option: string) => {
        if (disabled) return;

        // Trigger external onAnswer callback if necessary
        onAnswer();

        try {
            // Await the sendAnswer function to properly resolve or reject
            await toast.promise(sendAnswer(option), {
                loading: "Submitting answer...",
                success: "Answer submitted!",
                error: "Error submitting answer.",
            });
        } catch (error) {
            console.error("Error while submitting answer:", error);
        }
    };

    // Animation variants
    const buttonVariants = {
        initial: {scale: 1},
        hover: {scale: 1.05},
        tap: {scale: 0.95},
    };

    return (
        <motion.button
            onClick={() => handleOptionClick(option)}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            disabled={disabled}
            className={`bg-${color}-500 text-white py-4 px-4 rounded-lg transition text-center text-xl font-semibold ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
        >
            {text}
        </motion.button>
    );
};

export default QuizButton;
