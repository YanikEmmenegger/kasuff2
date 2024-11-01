// src/components/avatar/types/avatarTypes.ts

export interface AvatarOptions {
    faceColor: string;
    faceShape: 'round' | 'oval';
    eyeType: 'male' | 'female';
    eyeColor: string;
    hairType: 'short' | 'long' | 'the shed' | 'middle' | 'the dan';
    hairColor: string;
    beardType: 'none' | 'mustache' | 'goatee' | 'full';
    beardColor: string;
    mouthType: 'male' | 'female';
    mouthColor: string;
    noseType: 'small' | 'medium' | 'large';
    noseColor: string;
    eyebrowType: 'arched' | 'straight' | 'curved';
    eyebrowColor: string;
    // Add other properties as needed
}

export const defaultAvatarOptions: AvatarOptions = {
    faceColor: '#F9C9B6',
    faceShape: 'round',
    eyeType: 'male',
    eyeColor: '#000000',
    hairType: 'short',
    hairColor: '#000000',
    beardType: 'none',
    beardColor: '#000000',
    mouthType: 'male',
    mouthColor: '#a11619',
    noseType: 'medium',
    noseColor: '#000000',
    eyebrowType: 'arched',
    eyebrowColor: '#000000',
    // Initialize other options
};
