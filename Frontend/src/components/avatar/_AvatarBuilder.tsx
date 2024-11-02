// src/components/avatar/AvatarBuilder.tsx
import {FC, useEffect, useState} from 'react';
import Avatar from './Avatar';
import ColorPicker from "./controls/ColorPicker";
import Button from "../Button";
import toast from "react-hot-toast";
import {usePlayer} from '../../contexts/playerProvider';
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {FaSpinner} from "react-icons/fa";
import {getRandomAvatarOptions} from "./avatarFunctions";
import {avatarPartsConfig} from "./types/avatarConfig";
import CarouselSelector from "./controls/CarouselSelector.tsx";
import {AvatarOptions, defaultAvatarOptions} from "./types/avatarType.ts";

const AvatarBuilder: FC = () => {
    const {player, updatePlayer} = usePlayer();
    const navigate = useNavigate();

    const [options, setOptions] = useState<AvatarOptions>(defaultAvatarOptions);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (player?.avatar) {
            setOptions(player.avatar);
        }
    }, [player]);

    const handleOptionChange = (optionName: keyof AvatarOptions, value: string) => {
        setOptions(prev => ({
            ...prev,
            [optionName]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await toast.promise(
                updatePlayer({avatar: options}),
                {
                    loading: "Saving Avatar...",
                    success: "Avatar updated successfully!",
                    error: "Failed to update Avatar.",
                }
            );
            setIsSaving(false);
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast.error("An unexpected error occurred.");
            setIsSaving(false);
        }
    };

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center h-auto bg-cyan-500 text-gray-200 p-6">
            <motion.div className="max-w-[90vw] w-full bg-cyan-600 p-8 rounded-lg shadow-lg"
                        initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6}}>
                <h2 className="text-3xl font-bold mb-6 text-center">Customize Your Avatar</h2>

                <div className="flex justify-center mb-8">
                    <Avatar size={200} options={options}/>
                </div>

                <Button className="bg-cyan-500 hover:bg-cyan-700 w-full my-5"
                        onClick={() => setOptions(getRandomAvatarOptions())}>
                    Randomize Avatar
                </Button>

                <div className="w-full space-y-6">
                    {avatarPartsConfig.map((partConfig) => {
                        const {part, color, style} = partConfig;
                        const currentColor = options[color.name as keyof AvatarOptions];
                        const currentStyle = options[style.name as keyof AvatarOptions];

                        return (
                            <motion.div key={part} className="flex flex-col" initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}>
                                <div className="flex items-center gap-5 mb-2">
                                    <span className="text-lg font-medium">{part}</span>
                                    <ColorPicker value={currentColor}
                                                 onChange={(value) => handleOptionChange(color.name as keyof AvatarOptions, value)}/>
                                </div>
                                <CarouselSelector label={style.label} value={currentStyle}
                                                  options={style.options as string[]}
                                                  onChange={(value) => handleOptionChange(style.name as keyof AvatarOptions, value)}/>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-4 mt-8">
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4}}>
                        <Button onClick={handleSave}
                                className={`w-full bg-green-500 hover:bg-green-600 text-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center justify-center ${isSaving ? 'cursor-not-allowed' : ''}`}
                                disabled={isSaving}>
                            {isSaving ? (<><FaSpinner className="animate-spin mr-2"/>Saving...</>) : ("Save Avatar")}
                        </Button>
                    </motion.div>
                    <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.6}}>
                        <Button onClick={handleGoBack}
                                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg font-semibold">
                            Back
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AvatarBuilder;
