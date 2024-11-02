// /src/components/avatar/parts/Beard/Beard.tsx

import React from 'react';
import {AvatarOptions} from "../types/avatarType.ts";
import FullBeard from "./beard/FullBeard.tsx";
import Mustache from "./beard/Mustache.tsx";
import Goatee from "./beard/Goatee.tsx";

type BeardProps = Pick<AvatarOptions, 'beardType' | 'beardColor'>


const Beard: React.FC<BeardProps> = ({beardColor, beardType}) => {
    switch (beardType) {
        case 'pringles':
            return (
                <Mustache color={beardColor}/>
            );
        case 'goatee':
            return (
                <Goatee color={beardColor}/>
            );
        case 'full':
            return (
                <FullBeard color={beardColor}/>
            );
        case 'none':
        default:
            return null;
    }
};

export default Beard;
