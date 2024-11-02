// src/components/avatar/types/avatarConfig.ts
import {
    BEARD_TYPE_OPTIONS,
    EYE_TYPE_OPTIONS,
    FACE_SHAPE_OPTIONS,
    HAIR_TYPE_OPTIONS,
    MOUTH_TYPE_OPTIONS,
    NOSE_TYPE_OPTIONS,
} from "./avatarType.ts"

export interface AvatarStyleOption {
    name: string;
    label: string;
    options: readonly string[];
}

export interface AvatarColorOption {
    name: string;
    label: string;
}

export interface AvatarPartConfig {
    part: string;
    color: AvatarColorOption;
    style: AvatarStyleOption;
}

export const avatarPartsConfig: AvatarPartConfig[] = [
    {
        part: 'Face',
        color: {name: 'faceColor', label: 'Face Color'},
        style: {name: 'faceShape', label: 'Face Shape', options: FACE_SHAPE_OPTIONS},
    },
    {
        part: 'Eyes',
        color: {name: 'eyeColor', label: 'Eye Color'},
        style: {name: 'eyeType', label: 'Eye Type', options: EYE_TYPE_OPTIONS},
    },
    {
        part: 'Hair',
        color: {name: 'hairColor', label: 'Hair Color'},
        style: {name: 'hairType', label: 'Hair Style', options: HAIR_TYPE_OPTIONS},
    },
    {
        part: 'Beard',
        color: {name: 'beardColor', label: 'Beard Color'},
        style: {name: 'beardType', label: 'Beard Style', options: BEARD_TYPE_OPTIONS},
    },
    {
        part: 'Mouth',
        color: {name: 'mouthColor', label: 'Mouth Color'},
        style: {name: 'mouthType', label: 'Mouth Type', options: MOUTH_TYPE_OPTIONS},
    },
    {
        part: 'Nose',
        color: {name: 'noseColor', label: 'Nose Color'},
        style: {name: 'noseType', label: 'Nose Size', options: NOSE_TYPE_OPTIONS},
    },

];
