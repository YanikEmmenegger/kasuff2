// src/components/game/HideAndSeek.tsx

import {usePlayer} from "../../../../contexts/playerProvider.tsx";
import {useCallback, useEffect, useState} from "react";
import {getRandomAvatarOptions} from "../../../avatar/avatarFunctions.ts";
import AvatarItem from "./AvatarItem.tsx";
import {AvatarOptions} from "../../../avatar/types/avatarType.ts";
import {twMerge} from "tailwind-merge";
import toast from "react-hot-toast";
import {v4 as uuidv4} from 'uuid'; // Import uuid

interface AvatarWithId {
    id: string; // Changed to string
    options: AvatarOptions;
    isPlayer: boolean;
}

const HideAndSeek = () => {
    const {player, sendAnswer} = usePlayer();
    const [avatars, setAvatars] = useState<AvatarWithId[]>([]);
    const [wrongClicks, setWrongClicks] = useState<number>(0);
    const [wasWrong, setWasWrong] = useState(false);

    const TOTAL_AVATARS = 20; // This can be made dynamic if needed

    // Initialize avatars
    useEffect(() => {
        if (player?.avatar) {
            const generatedAvatars: AvatarWithId[] = [];

            // Add player's avatar with unique ID
            generatedAvatars.push({
                id: uuidv4(),
                options: player.avatar,
                isPlayer: true,
            });

            // Generate other avatars
            for (let i = 1; i < TOTAL_AVATARS; i++) {
                generatedAvatars.push({
                    id: uuidv4(),
                    options: getRandomAvatarOptions(),
                    isPlayer: false,
                });
            }

            // Shuffle avatars
            for (let i = generatedAvatars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [generatedAvatars[i], generatedAvatars[j]] = [generatedAvatars[j], generatedAvatars[i]];
            }

            setAvatars(generatedAvatars);
        }
    }, [player]);

    const handleAvatarClick = useCallback(async (isPlayer: boolean) => {
        if (isPlayer) {
            try {
                // Await the sendAnswer function to properly resolve or reject
                await toast.promise(sendAnswer(wrongClicks + 1), {
                    loading: "Submitting answer...",
                    success: "Answer submitted!",
                    error: "Error submitting answer.",
                });
            } catch (error) {
                console.error("Error while submitting answer:", error);
            }
        } else {
            setWrongClicks(prev => {
                const newCount = prev + 1;
                console.log('Wrong Clicks:', newCount);
                return newCount;
            });
            setWasWrong(true);
            setTimeout(() => setWasWrong(false), 300); // Increased duration for visibility
        }
    }, [sendAnswer, wrongClicks]);

    const handleRemoveAvatar = useCallback((id: string) => { // Changed parameter type to string
        setAvatars(prevAvatars => prevAvatars.filter(avatar => avatar.id !== id));
    }, []);

    return (
        <div
            className={twMerge(
                "w-screen gap-1 flex-col h-screen flex items-center justify-center bg-red-600 relative overflow-hidden",
                wasWrong ? "bg-opacity-100" : "bg-opacity-0"
            )}
        >
            <div className="text-xl font-bold">
                Find your avatar! and click on it
            </div>
            <div>Caution ‼️ Don't touch any other avatars ⛔️</div>
            {/* Avatars */}
            {avatars.map((avatar) => (
                <AvatarItem
                    key={avatar.id}
                    id={avatar.id}
                    options={avatar.options}
                    isPlayer={avatar.isPlayer}
                    onClick={handleAvatarClick}
                    onRemove={handleRemoveAvatar}
                />
            ))}
        </div>
    );
};

export default HideAndSeek;
