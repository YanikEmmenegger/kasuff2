import {FC} from "react";
import {motion} from "framer-motion";
import Quote from "../../Quote";
import Button from "../../Button.tsx";
import {usePlayer} from "../../../contexts/playerProvider.tsx";
import toast from "react-hot-toast";

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

    const handleEndRound = async () => {
        try {
            await toast.promise(forceEndRound(), {
                loading: 'Ending round...',
                success: 'Round ended!',
                error: 'Not in round.',
            });
        } catch (error) {
            console.error('Error ending round:', error);
        }
    }


    const {player, game, forceEndRound} = usePlayer();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-500 text-gray-200 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center space-y-2">
                <h1 className="text-4xl font-bold text-cyan-800">Hang on....</h1>
                <p className="text-xl">relax and have a drink 🍹</p>
            </div>

            {/* Animated Dots */}
            <LoadingDots/>
            {
                player?._id === game?.creatorId && <Button onClick={handleEndRound}
                                                           className={"disabled:cursor-not-allowed mt-10 bg-red-500 hover:bg-red-600"}>
                    Force end round
                </Button>
            }
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
