// src/components/game/HideAndSeek.tsx

import {usePlayer} from "../../../../contexts/playerProvider.tsx";
import {useCallback, useEffect, useState} from "react";
import {getRandomAvatarOptions} from "../../../avatar/avatarFunctions.ts";
import AvatarItem from "./AvatarItem.tsx";
import {AvatarOptions} from "../../../avatar/types/avatarType.ts";
import {twMerge} from "tailwind-merge";
import toast from "react-hot-toast";


const HideAndSeek = () => {
    const {player, sendAnswer} = usePlayer();
    const [avatars, setAvatars] = useState<AvatarOptions[]>([]);
    const [wrongClicks, setWrongClicks] = useState<number>(0);
    const [wasWrong, setWasWrong] = useState(false)

    const TOTAL_AVATARS = 20; // This can be made dynamic if needed

    // Initialize avatars
    useEffect(() => {
        if (player?.avatar) {
            const generatedAvatars: AvatarOptions[] = [];

            // Add player's avatar
            generatedAvatars.push(player.avatar);

            // Generate other avatars
            for (let i = 1; i < TOTAL_AVATARS; i++) {
                generatedAvatars.push(getRandomAvatarOptions());
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
            //T ODO SEND ANSWER TO SERVER
            alert('Correct!');
            try {
                // Await the sendAnswer function to properly resolve or reject
                await toast.promise(sendAnswer(wrongClicks), {
                    loading: "Submitting answer...",
                    success: "Answer submitted!",
                    error: "Error submitting answer.",
                });
            } catch (error) {
                console.error("Error while submitting answer:", error);
            }


        } else {
            setWrongClicks(prev => prev + 1);
            console.log('Wrong Clicks:', wrongClicks);
            setWasWrong(true);
            setTimeout(() => setWasWrong(false), 30)
        }
    }, [wrongClicks]);


    return (
        <div
            className={twMerge("w-screen h-screen bg-red-600 relative overflow-hidden", wasWrong ? "bg-opacity-100" : "bg-opacity-0")}>

            {/* Avatars */}
            {avatars.map((avatar, index) => (
                <AvatarItem
                    key={index}
                    id={index}
                    options={avatar}
                    isPlayer={avatar === player?.avatar}
                    onClick={handleAvatarClick}
                />
            ))}

        </div>
    );
};

export default HideAndSeek;
