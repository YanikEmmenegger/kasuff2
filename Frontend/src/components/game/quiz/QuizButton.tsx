import {FC} from "react";
import {motion} from "framer-motion";
import toast from "react-hot-toast";
import {usePlayer} from "../../../contexts/playerProvider";
import Avatar from "../../avatar/Avatar.tsx";
import {defaultAvatarOptions} from "../../avatar/types/avatarType.ts";

interface QuizButtonProps {
    text: string;
    option: string;
    color: string;
    index: number;
    disabled?: boolean;
    onAnswer: () => void;
    isPlayer?: boolean;
}

const QuizButton: FC<QuizButtonProps> = ({
                                             text,
                                             color,
                                             disabled,
                                             onAnswer,
                                             option,
                                             isPlayer,
                                         }) => {
    const {sendAnswer, game} = usePlayer();

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

    const getAvatar = (playerId: string) => {
        if (!game) {
            return defaultAvatarOptions;
        }
        const player = game.players.find((p) => p._id === playerId);
        if (player) {
            return player.avatar;
        }
        return defaultAvatarOptions;
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
            className={`bg-${color}-500 text-white py-4 px-4 rounded-lg flex flex-col justify-center items-center transition text-center text-xl font-semibold ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
        >
            {isPlayer && <Avatar size={60} options={getAvatar(option)!} />}
            {text}
        </motion.button>
    );
};

export default QuizButton;
