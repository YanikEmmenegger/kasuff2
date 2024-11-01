// /src/components/avatar/parts/FaceShape/FaceShape.tsx

import React from 'react';
import FaceRound from "./face/FaceRound.tsx";
import FaceOval from "./face/FaceOval.tsx";
import {AvatarOptions} from "../types/avatarType.ts";

type FaceShapeProps = Pick<AvatarOptions, 'faceColor' | 'faceShape'>


const FaceShape: React.FC<FaceShapeProps> = ({faceColor, faceShape}) => {
    switch (faceShape) {
        case 'round':
            return <FaceRound color={faceColor}/>
        case 'oval':
            return <FaceOval color={faceColor}/>
        default:
            return null;
    }
};

export default FaceShape;
