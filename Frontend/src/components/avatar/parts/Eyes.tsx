// /src/components/avatar/parts/Eyes/Eyes.tsx

import React from 'react';
import MaleEyes from "./eyes/MaleEyes.tsx";
import FemaleEyes from "./eyes/FemaleEyes.tsx";
import {AvatarOptions} from "../types/avatarType.ts";

type EyesProps = Pick<AvatarOptions, 'eyeType' | 'eyeColor'>


const Eyes: React.FC<EyesProps> = ({eyeType, eyeColor}) => {
    switch (eyeType) {
        case 'male':
            return <MaleEyes color={eyeColor}/>;
        case "female":
            return <FemaleEyes color={eyeColor}/>;

        default:
            return <MaleEyes color={eyeColor}/>;
    }
};

export default Eyes;
