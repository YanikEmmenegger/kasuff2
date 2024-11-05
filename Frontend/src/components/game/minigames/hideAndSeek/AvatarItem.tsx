// src/components/game/AvatarItem.tsx

import {FC, useLayoutEffect, useState} from 'react';
import {motion, useAnimation} from 'framer-motion';
import Avatar from "../../../avatar/Avatar.tsx";
import {AvatarOptions} from "../../../avatar/types/avatarType.ts";
import {twMerge} from "tailwind-merge";

interface AvatarItemProps {
    id: number;
    options: AvatarOptions;
    isPlayer: boolean;
    onClick: (isPlayer: boolean) => void;
}

const AvatarItem: FC<AvatarItemProps> = ({id, options, isPlayer, onClick}) => {
    const controls = useAnimation();
    const [isVisible, setIsVisible] = useState(true);

    /**
     * Generates a random position within the viewport bounds.
     * Ensures that avatars do not spawn too close to the edges.
     * @returns An object containing x and y coordinates.
     */
    const getRandomPosition = () => {
        const avatarSize = 50; // Size of the avatar
        const padding = 100; // Padding from the edges to prevent overflow

        const maxX = window.innerWidth - avatarSize - padding;
        const maxY = window.innerHeight - avatarSize - padding;

        const randomX = Math.random() * (maxX) + padding;
        const randomY = Math.random() * (maxY) + padding;

        return {x: randomX, y: randomY};
    };

    /**
     * Initiates movement to a random position within the allowed boundaries.
     * Ensures that avatars stay within the viewport.
     */
    const moveAvatar = async () => {
        const newPos = getRandomPosition();
        const duration = 5 + Math.random() * 5; // Random duration between 5-10 seconds

        await controls.start({
            x: newPos.x,
            y: newPos.y,
            transition: {
                duration,
                ease: 'linear',
            },
        });

        moveAvatar(); // Recursively call to continue moving
    };

    useLayoutEffect(() => {
        // Set the initial position before the component is painted
        const initialPos = getRandomPosition();
        controls.set({x: initialPos.x, y: initialPos.y});
        moveAvatar();

        // Clean up animation controls on component unmount
        return () => controls.stop();
    }, []);

    return (
        <motion.div
            id={`avatar-${id}`}
            className={twMerge("absolute cursor-pointer", isVisible ? 'block' : 'hidden')}
            animate={controls}
            initial={false} // Prevent Framer Motion from applying initial animation
            style={{top: 0, left: 0}} // Position relative to the parent container
            onClick={() => {
                setIsVisible(false)
                onClick(isPlayer)
            }}
        >
            <Avatar size={70} options={options}/>
        </motion.div>
    );
};

export default AvatarItem;
