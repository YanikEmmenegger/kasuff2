// src/components/quiz/SpyCard.tsx

import {FC} from "react";
import {motion} from "framer-motion";
import {twMerge} from "tailwind-merge";

interface SpyCardProps {
    onClick: () => void;
    cardRevealed: boolean;
    isSpy: boolean;
    secret: string;
    hints: string[];
}

const SpyCard: FC<SpyCardProps> = ({onClick, cardRevealed, isSpy, secret, hints}) => {
    return (
        <motion.div
            className={`mx-auto relative w-64 h-32 md:w-80 md:h-40 ${
                /* Optionally, disable pointer events based on a prop */
                "cursor-pointer"
            }`}
            onClick={onClick}
            style={{perspective: 600}}
            initial="initial"
            animate="animate"
            variants={{
                initial: {rotateY: 180},
                animate: {rotateY: cardRevealed ? 0 : 180},
            }}
            transition={{duration: 0.8}}
        >
            {/* Inner Container */}
            <motion.div
                className="absolute inset-0"
                style={{transformStyle: "preserve-3d"}}
            >
                {/* Front Side */}
                <motion.div
                    initial={{opacity: 0}}
                    transition={{duration: 0.1, delay: 0.2}} // Delay the reveal animation
                    //animate on cardRevealed prop change
                    animate={{opacity: !cardRevealed ? 1 : 0, rotateY: 180}}
                    className="absolute inset-0 flex items-center justify-center bg-cyan-600 text-white font-bold text-2xl rounded-md back face-hidden"
                >
                    Tap to see ❓
                </motion.div>

                {/* Back Side */}
                <motion.div
                    initial={{opacity: 0}}
                    transition={{duration: 0.6, delay: 0.4}} // Delay the reveal animation
                    //animate on cardRevealed prop change
                    animate={{opacity: cardRevealed ? 1 : 0,}}

                    className={twMerge("absolute inset-0 flex flex-col items-center justify-center bg-cyan-600 text-white font-bold text-2xl rounded-md bac kface-hidden", cardRevealed ? "" : "hidden")}
                >
                    {isSpy ? "You're the SPY 🧐" : (
                        <>
                            <p className={"text-lg"}>{secret}</p>
                            <p className={"text-sm"}>hints: {hints.join(", ")}</p>
                        </>
                    )}
                    <p className={"text-xs"}>Will hide again in 5s</p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default SpyCard;
