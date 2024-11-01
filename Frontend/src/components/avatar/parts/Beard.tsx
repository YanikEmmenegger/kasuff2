// /src/components/avatar/parts/Beard/Beard.tsx

import React from 'react';
import {AvatarOptions} from "../types/avatarType.ts";

type BeardProps = Pick<AvatarOptions, 'beardType' | 'beardColor'>


const Beard: React.FC<BeardProps> = ({beardColor, beardType}) => {
    switch (beardType) {
        case 'mustache':
            return (
                <path
                    d="M80,130 Q100,140 120,130"
                    stroke={beardColor}
                    strokeWidth="5"
                    fill="none"
                />
            );
        case 'goatee':
            return (
                <path
                    d="M90,150 L110,150 L110,160 L90,160 Z"
                    fill={beardColor}
                />
            );
        case 'full':
            return (
                <path
                    d="M70,130 C80,160 120,160 130,130 Z"
                    fill={beardColor}
                />
            );
        case 'none':
        default:
            return null;
    }
};

export default Beard;
