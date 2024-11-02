// src/pages/HomePage.tsx

import {FC} from "react";
import {usePlayer} from "../contexts/playerProvider.tsx";
import {AiFillEdit, AiFillSetting} from "react-icons/ai";
import {motion} from "framer-motion";
import Avatar from "../components/avatar/Avatar.tsx";
import {useNavigate} from "react-router";
import Button from "../components/Button.tsx";
import {GiJoin} from "react-icons/gi";
import {IoCreate} from "react-icons/io5";
import SupportButton from "../components/SupportButton.tsx";

const HomePage: FC = () => {
    const {player} = usePlayer();
    const navigate = useNavigate();

    const handleEditAvatar = () => {
        navigate('/profile');
    };

    return (
        <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-cyan-500 p-4">

            {/* Main Content Container */}
            <motion.div
                className="max-w-md w-full bg-cyan-600 p-8 rounded-lg shadow-lg flex flex-col items-center gap-6 relative" // Added 'relative' for positioning
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.6}}
            >
                {/* [BETA] Label */}
                <motion.div
                    className="absolute -right-6 -top-1"
                    initial={{opacity: 0, y: 0}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.8}}
                >
                    <div
                        className="bg-red-600 shadow-lg text-xs md:text-sm font-bold text-white p-2 rounded-lg transform rotate-45">
                        [ BETA ]
                    </div>
                </motion.div>

                {/* Greeting Title */}
                <motion.h1
                    className="text-3xl md:text-4xl font-bold text-white text-center"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    Hi, {player?.name}
                </motion.h1>

                {/* Avatar Section */}
                {player?.avatar && (
                    <motion.div
                        className="relative mb-10"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.2}}
                    >
                        <Avatar size={150} options={player.avatar}/>
                        <Button
                            onClick={handleEditAvatar}
                            className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transform translate-x-1/2 translate-y-1/2"
                            aria-label="Edit Avatar"
                        >
                            <AiFillEdit size={20}/>
                        </Button>
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <motion.div
                    className="flex flex-col w-full gap-4"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4}}
                >
                    <Button
                        onClick={() => navigate('/game?state=join')}
                        className="w-full gap-5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-center"
                    >
                        Join Game <GiJoin/>
                    </Button>
                    <Button
                        onClick={() => navigate('/game?state=create')}
                        className="w-full bg-purple-500 gap-5 hover:bg-purple-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-center"
                    >
                        Create Game <IoCreate/>
                    </Button>
                    <SupportButton/>
                </motion.div>

                {/* Settings Icon */}
                <motion.div
                    className="flex items-center justify-center w-full mt-4"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.6}}
                >
                    <p className="mr-2 text-white font-medium">Settings</p>
                    <button
                        onClick={handleEditAvatar}
                        className="text-white cursor-pointer hover:scale-110 hover:rotate-90 transition-transform duration-300"
                        aria-label="Settings"
                    >
                        <AiFillSetting size={30}/>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HomePage;
