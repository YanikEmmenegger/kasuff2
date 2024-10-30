import  {FC} from "react";
import {motion} from "framer-motion";
import Quote from "../../Quote";

const LoadingDots: FC = () => {
    const dotStyle = "w-4 h-4 rounded-full";

    const commonAnimation = {
        y: [0, -15, 0],
    };

    const commonTransition = {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 0.6,
        ease: "easeInOut",
    };

    return (
        <div className="flex space-x-2 mt-6">
            <motion.div
                className={`${dotStyle} bg-cyan-600`}
                animate={commonAnimation}
                transition={{...commonTransition, delay: 0}}
            ></motion.div>
            <motion.div
                className={`${dotStyle} bg-cyan-700`}
                animate={commonAnimation}
                transition={{...commonTransition, delay: 0.2}}
            ></motion.div>
            <motion.div
                className={`${dotStyle} bg-cyan-800`}
                animate={commonAnimation}
                transition={{...commonTransition, delay: 0.4}}
            ></motion.div>
        </div>
    );
};

const WaitingRoom: FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-500 text-gray-200 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center space-y-2">
                <h1 className="text-4xl font-bold text-cyan-800">Hang on....</h1>
                <p className="text-xl">relax and have a drink 🍹</p>
            </div>

            {/* Animated Dots */}
            <LoadingDots/>

            {/* Quote Section */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 1}}
                className="p-4 flex items-center justify-center w-full absolute bottom-10 left-0"
            >
                <Quote/>
            </motion.div>
        </div>
    );
};

export default WaitingRoom;
