// src/components/game/AvatarItem.tsx

import {FC, useEffect} from 'react';
import {motion, useAnimation} from 'framer-motion';
import Avatar from "../../../avatar/Avatar.tsx";
import {AvatarOptions} from "../../../avatar/types/avatarType.ts";

interface AvatarItemProps {
    id: string;
    options: AvatarOptions;
    isPlayer: boolean;
    onClick: (isPlayer: boolean) => void;
    onRemove: (id: string) => void;
}

const AvatarItem: FC<AvatarItemProps> = ({id, options, isPlayer, onClick, onRemove}) => {
    const controls = useAnimation();

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

        const randomX = Math.random() * maxX + padding;
        const randomY = Math.random() * maxY + padding;

        return {x: randomX, y: randomY};
    };

    /**
     * Initiates movement to a random position within the allowed boundaries.
     * Ensures that avatars stay within the viewport.
     */
    const initiateMove = async () => {
        const newPos = getRandomPosition();
        const duration = 5 + Math.random() * 5; // Random duration between 5-10 seconds

        try {
            await controls.start({
                x: newPos.x,
                y: newPos.y,
                transition: {
                    duration,
                    ease: 'linear',
                },
            });
        } catch (error) {
            // Handle animation cancellation if component unmounts
            console.error(`Animation error for avatar ${id}:`, error);
        }
    };

    useEffect(() => {
        // Start the first animation after component mounts
        initiateMove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Handler for when an animation completes.
     * Initiates the next movement.
     */
    const handleAnimationComplete = () => {
        initiateMove();
    };

    const handleClick = () => {
        onClick(isPlayer);
        onRemove(id);
    };

    return (
        <motion.div
            id={`avatar-${id}`}
            className="absolute cursor-pointer"
            animate={controls}
            initial={getRandomPosition()} // Set initial position
            onAnimationComplete={handleAnimationComplete}
            style={{top: 0, left: 0}} // Position relative to the parent container
            onClick={handleClick}
        >
            <Avatar size={70} options={options}/>
        </motion.div>
    );
};

export default AvatarItem;
