// /src/components/avatar/parts/Nose/Nose.tsx

import React from 'react';
import {AvatarOptions} from "../types/avatarType.ts";

type NoseProps = Pick<AvatarOptions, 'noseType' | 'noseColor'>


const Nose: React.FC<NoseProps> = ({noseType, noseColor}) => {
    switch (noseType) {
        case 'small':
            return <circle cx="100" cy="120" r="5" fill={noseColor}/>;
        case 'medium':
            return <circle cx="100" cy="120" r="7" fill={noseColor}/>;
        case 'large':
            return <circle cx="100" cy="120" r="9" fill={noseColor}/>;
        default:
            return null;
    }
};

export default Nose;
