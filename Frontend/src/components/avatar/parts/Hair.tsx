// /src/components/avatar/parts/Hair/Hair.tsx

import React from 'react';
import MiddleLongHair from "./hair/MiddleLongHair.tsx";
import LongHair from "./hair/LongHair.tsx";
import ShortHair from "./hair/ShortHair.tsx";
import CurlyHair from "./hair/CurlyHair.tsx";
import {AvatarOptions} from "../types/avatarType.ts";

type HairProps = Pick<AvatarOptions, 'hairType' | 'hairColor'>


const Hair: React.FC<HairProps> = ({hairColor, hairType}) => {
    switch (hairType) {
        case 'short':
            return (
                <ShortHair color={hairColor}/>
            );
        case 'long':
            return <LongHair color={hairColor}/>
        case 'middle':
            return (
                <MiddleLongHair color={hairColor}/>
            );
        case 'the shed':
            return <CurlyHair color={hairColor}/>
        case 'the dan':
            return null; // No hair drawn
        default:
            return null;
    }
};

export default Hair;
