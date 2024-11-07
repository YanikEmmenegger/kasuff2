import {FC, useMemo} from "react";
import {motion} from "framer-motion";
import {twMerge} from "tailwind-merge";

interface LampProps {
    color: string;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
    isGameCompleted: boolean; // New prop
}

const Lamp: FC<LampProps> = ({color, isActive, onClick, disabled, isGameCompleted}) => {
    const colorMap = {
        red: {
            active: "bg-red-300",
            inactive: "bg-red-500",
        },
        green: {
            active: "bg-green-300",
            inactive: "bg-green-500",
        },
        blue: {
            active: "bg-blue-300",
            inactive: "bg-blue-500",
        },
        yellow: {
            active: "bg-yellow-300",
            inactive: "bg-yellow-500",
        },
        purple: {
            active: "bg-purple-300",
            inactive: "bg-purple-500",
        },
        pink: {
            active: "bg-pink-300",
            inactive: "bg-pink-500",
        },
        orange: {
            active: "bg-orange-300",
            inactive: "bg-orange-500",

        },
        indigo: {
            active: "bg-indigo-300",
            inactive: "bg-indigo-500",
        },
        sky: {
            active: "bg-sky-300",
            inactive: "bg-sky-500",
        }
    };

    const colorClass = isActive
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        ? colorMap[color]?.active || "bg-gray-300"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        : colorMap[color]?.inactive || "bg-gray-500";

    const randomDelay = useMemo(() => Math.random() * 0.1 + 0.1, []);

    const lampVariants = {
        initial: {y: 0, opacity: 1},
        gameCompleted: {
            y: 1000, // Lamps fall down
            opacity: 0,
            transition: {
                duration: 1,
                delay: randomDelay, // Use the random delay for each lamp
            },
        },
    };

    return (
        <motion.button
            className={twMerge(
                `w-24 h-24 md:w-32 md:h-32 rounded-full shadow-md focus:outline-none`,
                colorClass,
                disabled ? "cursor-not-allowed" : "cursor-pointer",
                isActive ? "ring-4 ring-white" : ""
            )}
            onClick={onClick}
            disabled={disabled}
            whileTap={disabled ? {} : {scale: 0.9}}
            variants={lampVariants}
            initial="initial"
            animate={isGameCompleted ? "gameCompleted" : "initial"}
        ></motion.button>
    );
};

export default Lamp;
