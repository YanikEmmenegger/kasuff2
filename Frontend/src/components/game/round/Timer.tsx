import {FC, useEffect, useState} from "react";
import {motion} from "framer-motion";
import {usePlayer} from "../../../contexts/playerProvider";
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

    // Animation variants
    const timerVariants = {
        initial: {opacity: 0},
        visible: {opacity: 1},
        warning: {opacity: 1, background: "#F00F00"}, // Tailwind's red-400
    };

    // Determine text color based on time remaining
    const isWarning = seconds <= 5 && timeLeft > 0;

    return (
        <motion.div
            className={twMerge(
                "relative top-4 left-1/2 transform text-center -translate-x-1/2 bg-cyan-600 bg-opacity-20 px-4 py-2 rounded-full",
                timeLeft === 0 ? "opacity-0" : "opacity-100"
            )}
            variants={timerVariants}
            initial="initial"
            animate={isWarning ? "warning" : "visible"}
            transition={{duration: 0.5}}
            key={seconds} // This will trigger the animation on every second change
        >
            <span className="text-2xl font-bold">{seconds}s</span>
        </motion.div>
    );
};

export default Timer;
