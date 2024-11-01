// /src/components/avatar/parts/Mouth/Mouth.tsx

import React from 'react';
import MaleMouth from "../mouth/MaleMouth.tsx";
import FemaleMouth from "../mouth/FemaleMouth.tsx";
import {AvatarOptions} from "../types/avatarType.ts";

type MouthProps = Pick<AvatarOptions, 'mouthType' | 'mouthColor'>


const Mouth: React.FC<MouthProps> = ({mouthType, mouthColor}) => {
    switch (mouthType) {
        case 'female':
            return <FemaleMouth color={mouthColor}/>;
        case 'male':
            return <MaleMouth color={mouthColor}/>;

        default:
            return <MaleMouth color={mouthColor}/>;
    }
};

export default Mouth;
