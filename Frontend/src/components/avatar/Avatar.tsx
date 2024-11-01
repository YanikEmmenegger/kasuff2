// src/components/avatar/Avatar.tsx

import React from 'react';
import FaceShape from "./parts/FaceShape.tsx";
import Beard from "./parts/Beard.tsx";
import Eyes from "./parts/Eyes.tsx";
import Nose from "./parts/Nose.tsx";
import Mouth from "./parts/Mouth.tsx";
import Hair from "./parts/Hair.tsx";
import {AvatarOptions} from "./types/avatarType.ts";


interface AvatarProps {
    options: AvatarOptions;
    size: number;
}

const Avatar: React.FC<AvatarProps> = ({options, size}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="avatarTitle"
            role="img"
        >
            <title id="avatarTitle">User Avatar</title>

            {/* Face Shape */}
            <FaceShape faceColor={options.faceColor} faceShape={options.faceShape}/>

            {/* Beard */}

            {/* Eyes */}
            <Eyes eyeType={options.eyeType} eyeColor={options.eyeColor}/>

            {/* Nose */}
            <Nose noseType={options.noseType} noseColor={options.noseColor}/>

            {/* Mouth */}
            <Mouth mouthType={options.mouthType} mouthColor={options.mouthColor}/>

            {/* Hair */}
            <Hair hairType={options.hairType} hairColor={options.hairColor}/>
            <Beard beardType={options.beardType} beardColor={options.beardColor}/>


            {/* Add other parts here */}
        </svg>
    );
};

export default Avatar;
