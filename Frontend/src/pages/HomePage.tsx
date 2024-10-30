import {usePlayer} from "../contexts/playerProvider.tsx";
import {AiFillSetting} from "react-icons/ai";
import Navigation from "../components/navigation/Navigation.tsx";
import {motion} from "framer-motion";
import Avatar from "../components/avatar/Avatar.tsx";

const HomePage = () => {
    const {player} = usePlayer();

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6}}
            className="w-screen min-h-screen h-auto flex flex-col justify-center items-center gap-12">
            {/* Title */}
            <motion.h1
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="md:text-5xl text-2xl font-bold text-white mb-6 text-center">
                Hi, {player?.name}
            </motion.h1>
            <div>
                {/* Avatar */}
                {
                    player?.avatar && <Avatar options={player.avatar}/>
                }
            </div>

            {/* Navigation for Join and Create Game */}
            <div className="w-full flex justify-center">
                <Navigation/> {/* Navigation component */}
            </div>

            {/* Settings Icon */}
            <div className="fixed flex gap-3 justify-center items-center right-5 bottom-5">
                <p>change name</p>
                <a href="/profile">
                    <AiFillSetting
                        className="text-white cursor-pointer hover:scale-105 hover:rotate-90 transition-transform duration-300 text-5xl"/>
                </a>
            </div>
        </motion.div>
    );
};

export default HomePage;
