import React from 'react';
import {AvatarType} from '../../types';
import {Hat} from "./AvatarParts/Hat.tsx";
import {Face} from "./AvatarParts/Face.tsx";
import {Body} from "./AvatarParts/body.tsx";
import {Pants} from "./AvatarParts/pants.tsx";

interface AvatarProps {
    avatar: AvatarType;
}

const AvatarComponent: React.FC<AvatarProps> = ({avatar}) => {
    return (
        <svg width="150" height="300" viewBox="0 0 150 300">
            {/* Hat */}
            <Hat variant={avatar.hat.variant} color={avatar.hat.color}/>

            {/* Face */}
            <Face variant={avatar.face.variant} color={avatar.face.color}/>

            {/* Body */}
            <Body variant={avatar.body.variant} color={avatar.body.color}/>

            {/* Pants */}
            <Pants variant={avatar.pants.variant} color={avatar.pants.color}/>
        </svg>
    );
};

export default AvatarComponent;
