// src/components/avatar/AvatarBuilder.tsx

import React, {useState} from 'react';
import Avatar from './Avatar';
import {AvatarOptionConfig, avatarOptionsConfig} from "./types/avatarConfig";
import SliderSelector from "./controls/SliderSelector";
import ColorPicker from "./controls/ColorPicker";
import Button from "../Button";
import toast from "react-hot-toast";
import {usePlayer} from '../../contexts/playerProvider';
import {AvatarOptions, defaultAvatarOptions} from "./avatarType.ts";

const AvatarBuilder: React.FC = () => {
    const {player} = usePlayer();

    const [options, setOptions] = useState<AvatarOptions>(
        player?.avatar ? player.avatar : defaultAvatarOptions
    );

    const handleOptionChange = (optionName: keyof AvatarOptions, value: string) => {
        setOptions((prev) => ({
            ...prev,
            [optionName]: value,
        }));
    };

    const {updatePlayer} = usePlayer();

    const handleSave = async () => {
        await toast.promise(
            updatePlayer({avatar: options}),
            {
                loading: "Saving Avatar...",
                success: "Avatar updated successfully!",
                error: "Failed to update user Avatar.",
            }
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-cyan-500 text-gray-200 p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Customize Your Avatar</h2>

            <Avatar size={200} options={options}/>

            {/* Controls */}
            <div className="w-full max-w-2xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {avatarOptionsConfig.map((config: AvatarOptionConfig) => {
                    if (config.type === 'slider' && config.options) {
                        return (
                            <SliderSelector
                                label={config.label}
                                value={options[config.name]}
                                options={config.options}
                                onChange={(value) => handleOptionChange(config.name, value)}
                            />
                        );
                    } else if (config.type === 'color') {
                        return (
                            <ColorPicker
                                label={config.label}
                                value={options[config.name]}
                                onChange={(value) => handleOptionChange(config.name, value)}
                            />
                        );
                    }
                    return null;
                })}
            </div>
            <Button onClick={handleSave} className="mt-6 bg-cyan-600 hover:bg-cyan-700">
                Save Avatar
            </Button>
        </div>
    );
};

export default AvatarBuilder;
