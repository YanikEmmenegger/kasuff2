// /src/components/avatar/AvatarBuilder.tsx

import React, {useState} from 'react';
import Avatar from './Avatar';
import {AvatarOptions, defaultAvatarOptions} from "./avatarType.ts";
import Button from "../Button.tsx";
import toast from "react-hot-toast";
import {usePlayer} from '../../contexts/playerProvider.tsx';



const AvatarBuilder: React.FC = () => {

    const {player} = usePlayer();

    const [options, setOptions] = useState<AvatarOptions>(player?.avatar ? player.avatar : defaultAvatarOptions);

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
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-cyan-500 text-gray-200 p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Customize Your Avatar</h2>

            <Avatar size={200} options={options}/>

            {/* Controls */}
            <div className="w-full max-w-2xl mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Face Shape Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Face Shape:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.faceShape}
                        onChange={(e) =>
                            handleOptionChange('faceShape', e.target.value as AvatarOptions['faceShape'])
                        }
                    >
                        <option value="round">Round</option>
                        <option value="square">Square</option>
                        <option value="oval">Oval</option>
                    </select>
                </div>

                {/* Face Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Face Color:</label>
                    <input
                        type="color"
                        value={options.faceColor}
                        onChange={(e) => handleOptionChange('faceColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>

                {/* Eye Type Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Eye Type:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.eyeType}
                        onChange={(e) =>
                            handleOptionChange('eyeType', e.target.value as AvatarOptions['eyeType'])
                        }
                    >
                        <option value="normal">Normal</option>
                        <option value="happy">Happy</option>
                        <option value="sleepy">Sleepy</option>
                    </select>
                </div>

                {/* Eye Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Eye Color:</label>
                    <input
                        type="color"
                        value={options.eyeColor}
                        onChange={(e) => handleOptionChange('eyeColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>

                {/* Hair Type Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Hair Style:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.hairType}
                        onChange={(e) =>
                            handleOptionChange('hairType', e.target.value as AvatarOptions['hairType'])
                        }
                    >
                        <option value="short">Short</option>
                        <option value="long">Long</option>
                        <option value="bald">Bald</option>
                    </select>
                </div>

                {/* Hair Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Hair Color:</label>
                    <input
                        type="color"
                        value={options.hairColor}
                        onChange={(e) => handleOptionChange('hairColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>

                {/* Beard Type Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Beard Style:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.beardType}
                        onChange={(e) =>
                            handleOptionChange('beardType', e.target.value as AvatarOptions['beardType'])
                        }
                    >
                        <option value="none">None</option>
                        <option value="mustache">Mustache</option>
                        <option value="goatee">Goatee</option>
                        <option value="full">Full Beard</option>
                    </select>
                </div>

                {/* Beard Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Beard Color:</label>
                    <input
                        type="color"
                        value={options.beardColor}
                        onChange={(e) => handleOptionChange('beardColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>

                {/* Mouth Type Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Mouth Expression:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.mouthType}
                        onChange={(e) =>
                            handleOptionChange('mouthType', e.target.value as AvatarOptions['mouthType'])
                        }
                    >
                        <option value="smile">Smile</option>
                        <option value="frown">Frown</option>
                        <option value="neutral">Neutral</option>
                    </select>
                </div>

                {/* Mouth Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Mouth Color:</label>
                    <input
                        type="color"
                        value={options.mouthColor}
                        onChange={(e) => handleOptionChange('mouthColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>

                {/* Nose Type Selector */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Nose Size:</label>
                    <select
                        className="p-2 rounded bg-cyan-600"
                        value={options.noseType}
                        onChange={(e) =>
                            handleOptionChange('noseType', e.target.value as AvatarOptions['noseType'])
                        }
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                {/* Nose Color Picker */}
                <div className="flex flex-col">
                    <label className="mb-2 font-semibold">Nose Color:</label>
                    <input
                        type="color"
                        value={options.noseColor}
                        onChange={(e) => handleOptionChange('noseColor', e.target.value)}
                        className="p-2 rounded bg-cyan-600"
                    />
                </div>
            </div>
            <Button onClick={handleSave} className="mt-6 bg-cyan-600 hover:bg-cyan-700">
                Save Avatar
            </Button>
        </div>
    );
};

export default AvatarBuilder;
