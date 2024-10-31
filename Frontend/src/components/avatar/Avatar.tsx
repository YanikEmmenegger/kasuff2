// /src/components/avatar/Avatar.tsx

import React from 'react';
import FaceShape from './parts/FaceShape';
import Eyes from './parts/Eyes';
import Hair from './parts/Hair';
import Beard from './parts/Beard';
import Mouth from './parts/Mouth';
import Nose from './parts/Nose';
import {AvatarOptions} from "./avatarType.ts";


interface AvatarProps {
    options: AvatarOptions;
    size: number;
}

const Avatar: React.FC<AvatarProps> = ({options, size}) => {
    return (
        <svg width={size} height={size} viewBox={"0 0 200 200"}>
            {/* Face Shape */}
            <FaceShape color={options.faceColor} shape={options.faceShape}/>

            {/* Hair */}
            <Hair type={options.hairType} color={options.hairColor}/>

            {/* Beard */}
            <Beard type={options.beardType} color={options.beardColor}/>

            {/* Eyes */}
            <Eyes type={options.eyeType} color={options.eyeColor}/>

            {/* Nose */}
            <Nose type={options.noseType} color={options.noseColor}/>

            {/* Mouth */}
            <Mouth type={options.mouthType} color={options.mouthColor}/>

            {/* Add other parts here */}
        </svg>
    );
};

export default Avatar;
