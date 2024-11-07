// src/components/avatar/types/avatarTypes.ts

export const FACE_SHAPE_OPTIONS = ['round', 'oval'] as const;
export const EYE_TYPE_OPTIONS = ['male', 'female'] as const;
export const HAIR_TYPE_OPTIONS = ['the-swoosh', 'long-1', 'the-shed', 'long-2', 'the-dan', 'the-jb'] as const;
export const BEARD_TYPE_OPTIONS = ['none', 'pringles', 'goatee', 'full'] as const;
export const MOUTH_TYPE_OPTIONS = ['male', 'female'] as const;
export const NOSE_TYPE_OPTIONS = ['small', 'medium', 'large'] as const;
export const EYEBROW_TYPE_OPTIONS = ['arched', 'straight', 'curved'] as const;

export interface AvatarOptions {
    faceColor: string;
    faceShape: typeof FACE_SHAPE_OPTIONS[number];
    eyeType: typeof EYE_TYPE_OPTIONS[number];
    eyeColor: string;
    hairType: typeof HAIR_TYPE_OPTIONS[number];
    hairColor: string;
    beardType: typeof BEARD_TYPE_OPTIONS[number];
    beardColor: string;
    mouthType: typeof MOUTH_TYPE_OPTIONS[number];
    mouthColor: string;
    noseType: typeof NOSE_TYPE_OPTIONS[number];
    noseColor: string;
    eyebrowType: typeof EYEBROW_TYPE_OPTIONS[number];
    eyebrowColor: string;
}

export const defaultAvatarOptions: AvatarOptions = {
    faceColor: '#F9C9B6',
    faceShape: 'round',
    eyeType: 'male',
    eyeColor: '#000000',
    hairType: 'the-dan',
    hairColor: '#000000',
    beardType: 'none',
    beardColor: '#000000',
    mouthType: 'male',
    mouthColor: '#a11619',
    noseType: 'medium',
    noseColor: '#000000',
    eyebrowType: 'arched',
    eyebrowColor: '#000000',
};
