// src/components/avatar/types/avatarConfig.ts

import {AvatarOptions} from "./avatarType.ts";


export interface AvatarStyleOption {
    name: keyof AvatarOptions;
    label: string;
    options: string[];
}

export interface AvatarColorOption {
    name: keyof AvatarOptions;
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
        color: {
            name: 'faceColor',
            label: 'Face Color',
        },
        style: {
            name: 'faceShape',
            label: 'Face Shape',
            options: ['round', 'oval'],
        },
    },
    {
        part: 'Eyes',
        color: {
            name: 'eyeColor',
            label: 'Eye Color',
        },
        style: {
            name: 'eyeType',
            label: 'Eye Type',
            options: ['male', 'female'],
        },
    },
    {
        part: 'Hair',
        color: {
            name: 'hairColor',
            label: 'Hair Color',
        },
        style: {
            name: 'hairType',
            label: 'Hair Style',
            options: ['short', 'long', 'the shed', 'middle', 'the dan'],
        },
    },
    {
        part: 'Beard',
        color: {
            name: 'beardColor',
            label: 'Beard Color',
        },
        style: {
            name: 'beardType',
            label: 'Beard Style',
            options: ['none', 'mustache', 'goatee', 'full'],
        },
    },
    {
        part: 'Mouth',
        color: {
            name: 'mouthColor',
            label: 'Mouth Color',
        },
        style: {
            name: 'mouthType',
            label: 'Mouth Expression',
            options: ['male', 'female'],
        },
    },
    {
        part: 'Nose',
        color: {
            name: 'noseColor',
            label: 'Nose Color',
        },
        style: {
            name: 'noseType',
            label: 'Nose Size',
            options: ['small', 'medium', 'large'],
        },
    },
    // Add other parts as needed
];
