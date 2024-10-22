import {motion, Variants} from "framer-motion";
import Logo from "../components/Logo";
import Navigation from "../components/navigation/Navigation";
import {useUser} from "../contexts/userProvider.tsx";
import {AiFillSetting} from "react-icons/ai";

const HomePage = () => {
    const {player} = useUser();

    const flyInVariants = (direction: "left" | "right" | "top" | "bottom"): Variants => {
        switch (direction) {
            case "left":
                return {
                    hidden: {x: "-100vw", opacity: 0},
                    visible: {x: 0, opacity: 1},
                };
            case "right":
                return {
                    hidden: {x: "100vw", opacity: 0},
                    visible: {x: 0, opacity: 1},
                };
            case "top":
                return {
                    hidden: {y: "-100vh", opacity: 0},
                    visible: {y: 0, opacity: 1},
                };
            case "bottom":
                return {
                    hidden: {y: "100vh", opacity: 0},
                    visible: {y: 0, opacity: 1},
                };
            default:
                return {};
        }
    };

    return (
        <div
            className="bg-gradient-to-br from-teal-500 via-purple-500 to-fuchsia-600 w-screen min-h-screen h-auto flex flex-col justify-start items-center pt-40 gap-10">
            {/* Title flying in from the top */}
            <motion.h1
                className="text-4xl font-bold text-white mb-8"
                initial="hidden"
                animate="visible"
                variants={flyInVariants("top")}
                transition={{duration: 1, ease: "easeInOut"}}
            >
                Welcome, {player?.name}
            </motion.h1>

            {/* Logo flying in from the left */}
            <motion.div
                className="mb-10"
                initial="hidden"
                animate="visible"
                variants={flyInVariants("left")}
                transition={{duration: 0.7, ease: "easeInOut"}}
            >
                <Logo width={150} height={150}/>
            </motion.div>

            {/* Navigation flying in from the right */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={flyInVariants("right")}
                transition={{duration: 1, ease: "easeInOut"}}
            >
                <Navigation/>
            </motion.div>
            <motion.div
                initial="hidden"
                animate="visible"
                className={"fixed right-5 bottom-5"}
            >
                <a href={"/profile"}>
                    <AiFillSetting className="text-white cursor-pointer hover:scale-105 text-5xl mb-2"/>
                </a>
            </motion.div>
        </div>
    );
};

export default HomePage;
