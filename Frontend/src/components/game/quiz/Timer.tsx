import {FC, useEffect, useState} from "react";
import {motion} from "framer-motion";
import {usePlayer} from "../../../contexts/playerProvider.tsx";
import {twMerge} from "tailwind-merge";

const Timer: FC = () => {
    const {game} = usePlayer();

    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!game) return;
        const targetTime = new Date(game?.timeRemaining).getTime();
        const timerInterval = setInterval(() => {
            const currentTimeLeft = Math.max(targetTime - Date.now(), 0); // Ensure no negative time
            setTimeLeft(currentTimeLeft);

            // Clear the interval when the countdown reaches zero
            if (currentTimeLeft <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        // Cleanup the interval on component unmount
        return () => clearInterval(timerInterval);
    }, [game]);

    // Convert timeLeft from milliseconds to seconds
    const seconds = Math.floor((timeLeft / 1000) % 60);

    // Framer Motion animation variants for pop effect
    const popAnimation = {
        hidden: {scale: 1},
        visible: {scale: [1, 1.3, 1]}, // Pop animation
    };

    // Determine text color based on time remaining
    const textColor = seconds <= 5 ? "text-red-500" : "text-white";

    return (
        <div
            className={twMerge(
                "fixed w-screen flex items-start justify-center",
                timeLeft === 0 ? "opacity-0" : "opacity-100"
            )}
        >
            <motion.div
                className={`text-lg font-bold ${textColor} bg-opacity-75 px-6 py-3 rounded-lg`}
                variants={popAnimation}
                initial="hidden"
                animate="visible"
                transition={{duration: 0.5}}
                key={seconds} // This will trigger the animation on every second change
            >
                {seconds < 10 ? `0${seconds}` : seconds}s
            </motion.div>
        </div>
    );
};

export default Timer;
