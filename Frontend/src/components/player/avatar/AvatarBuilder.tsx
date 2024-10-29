import {useEffect, useState} from 'react';
import {AvatarType} from "../../../types";
import AvatarComponent from "./Avatar";
import {usePlayer} from '../../../contexts/playerProvider.tsx';
import {defaultAvatar, hatVariants, faceVariants, bodyVariants, pantsVariants, colorOptions} from "./variants.ts";
import toast from "react-hot-toast";

const AvatarBuilder = () => {
    const {player, updatePlayer} = usePlayer(); // Use updatePlayer from the context
    const [avatar, setAvatar] = useState<AvatarType>(defaultAvatar);

    // Update avatar state when player data is loaded
    useEffect(() => {
        if (player?.avatar) {
            setAvatar(player.avatar);
        }
    }, [player]);

    // Update a specific avatar part (variant or color)
    const updateAvatarPart = (part: keyof AvatarType, key: 'variant' | 'color', value: number) => {
        setAvatar((prevAvatar) => ({
            ...prevAvatar,
            [part]: {
                ...prevAvatar[part],
                [key]: value,
            },
        }));
    };

    // Handle save action
    const handleSave = async () => {
        if (player) {
            toast.promise(
                updatePlayer({avatar}),  // Use the correct updatePlayer function
                {
                    loading: 'Saving avatar...',
                    success: 'Avatar saved successfully!',
                    error: 'Failed to save avatar.',
                }
            );
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <h1 className="text-3xl font-bold text-white">Create Your Avatar</h1>

            {/* Avatar display */}
            <AvatarComponent avatar={avatar}/>

            {/* Hat selection */}
            <div className="text-white">
                <label className="font-bold">Hat:</label>
                <select
                    value={avatar.hat.variant}
                    onChange={(e) => updateAvatarPart('hat', 'variant', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {hatVariants.map((_, index) => (
                        <option key={index} value={index}>
                            {hatVariants[index]}
                        </option>
                    ))}
                </select>
                <label className="ml-4 font-bold">Color:</label>
                <select
                    value={avatar.hat.color}
                    onChange={(e) => updateAvatarPart('hat', 'color', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {colorOptions.map((_, index) => (
                        <option key={index} value={index}>
                            {colorOptions[index]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Face selection */}
            <div className="text-white">
                <label className="font-bold">Face:</label>
                <select
                    value={avatar.face.variant}
                    onChange={(e) => updateAvatarPart('face', 'variant', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {faceVariants.map((_, index) => (
                        <option key={index} value={index}>
                            {faceVariants[index]}
                        </option>
                    ))}
                </select>
                <label className="ml-4 font-bold">Color:</label>
                <select
                    value={avatar.face.color}
                    onChange={(e) => updateAvatarPart('face', 'color', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {colorOptions.map((_, index) => (
                        <option key={index} value={index}>
                            {colorOptions[index]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Body selection */}
            <div className="text-white">
                <label className="font-bold">Body:</label>
                <select
                    value={avatar.body.variant}
                    onChange={(e) => updateAvatarPart('body', 'variant', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {bodyVariants.map((_, index) => (
                        <option key={index} value={index}>
                            {bodyVariants[index]}
                        </option>
                    ))}
                </select>
                <label className="ml-4 font-bold">Color:</label>
                <select
                    value={avatar.body.color}
                    onChange={(e) => updateAvatarPart('body', 'color', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {colorOptions.map((_, index) => (
                        <option key={index} value={index}>
                            {colorOptions[index]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Pants selection */}
            <div className="text-white">
                <label className="font-bold">Pants:</label>
                <select
                    value={avatar.pants.variant}
                    onChange={(e) => updateAvatarPart('pants', 'variant', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {pantsVariants.map((_, index) => (
                        <option key={index} value={index}>
                            {pantsVariants[index]}
                        </option>
                    ))}
                </select>
                <label className="ml-4 font-bold">Color:</label>
                <select
                    value={avatar.pants.color}
                    onChange={(e) => updateAvatarPart('pants', 'color', Number(e.target.value))}
                    className="ml-2 p-2 border border-gray-300 bg-gray-800 text-white rounded"
                >
                    {colorOptions.map((_, index) => (
                        <option key={index} value={index}>
                            {colorOptions[index]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="mt-6 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
                Save Avatar
            </button>
        </div>
    );
};

export default AvatarBuilder;
