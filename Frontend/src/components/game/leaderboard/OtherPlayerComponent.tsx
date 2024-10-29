import {FC} from "react";
import {motion} from "framer-motion";

interface OtherPlayerProps {
    position: number;
    name?: string;
    points: number;
}

const OtherPlayerComponent: FC<OtherPlayerProps> = ({position, name, points}) => {
    return (
        <motion.li
            className="p-4 rounded-lg border-2 border-gray-700 flex justify-between items-center"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
        >
            <span>#{position} {name}</span>
            <span className={points > 0 ? "text-green-400" : "text-red-500"}>{points} Points</span>
        </motion.li>
    );
};

export default OtherPlayerComponent;
