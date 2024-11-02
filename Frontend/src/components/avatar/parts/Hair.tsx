// /src/components/avatar/parts/Hair/Hair.tsx

import React from 'react';
import LongHair2 from "./hair/LongHair2.tsx";
import LongHair from "./hair/LongHair.tsx";
import TheSwoosh from "./hair/TheSwoosh.tsx";
import CurlyHair from "./hair/CurlyHair.tsx";
import {AvatarOptions} from "../types/avatarType.ts";
import BabyBieber from "./hair/BabyBieber.tsx";

type HairProps = Pick<AvatarOptions, 'hairType' | 'hairColor'>


const Hair: React.FC<HairProps> = ({hairColor, hairType}) => {
    switch (hairType) {
        case 'the-swoosh':
            return (
                <TheSwoosh color={hairColor}/>
            );
        case 'long-1':
            return <LongHair color={hairColor}/>
        case 'long-2':
            return (
                <LongHair2 color={hairColor}/>
            );
        case 'the-shed':
            return <CurlyHair color={hairColor}/>
        case 'the-jb':
            return <BabyBieber color={hairColor}/>
        case 'the-dan':
            return null; // No hair drawn
        default:
            return null;
    }
};

export default Hair;
