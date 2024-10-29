import {FC} from "react";
import {motion} from "framer-motion";

interface TopPlayerProps {
    position: number;
    name?: string;
    points: number;
}

const TopPlayerComponent: FC<TopPlayerProps> = ({position, name, points}) => {
    const borderColor =
        position === 1
            ? "border-yellow-500"
            : position === 2
                ? "border-gray-400"
                : "border-amber-700";

    const textColor =
        position === 1
            ? "text-yellow-500"
            : position === 2
                ? "text-gray-400"
                : "text-amber-700";

    return (
        <motion.div
            className={`p-4 rounded-lg border-2 ${borderColor} w-auto`}
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
        >
            <h3 className={`md:text-xl font-bold text-center ${textColor}`}>
                #{position} {name}
            </h3>
            <p className={`text-center ${points > 0 ? "text-green-400" : "text-red-500"}`}>
                {points} Points
            </p>
        </motion.div>
    );
};

export default TopPlayerComponent;
