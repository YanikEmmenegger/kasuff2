// /src/components/avatar/Avatar.tsx

export interface AvatarOptions {
    faceColor: string;
    faceShape: 'round' | 'square' | 'oval';
    eyeType: 'normal' | 'happy' | 'sleepy';
    eyeColor: string;
    hairType: 'short' | 'long' | 'bald';
    hairColor: string;
    beardType: 'none' | 'mustache' | 'goatee' | 'full';
    beardColor: string;
    mouthType: 'smile' | 'frown' | 'neutral';
    mouthColor: string;
    noseType: 'small' | 'medium' | 'large';
    noseColor: string;
    // Add other properties as needed
}

export const defaultAvatarOptions: AvatarOptions = {
    faceColor: '#F9C9B6',
    faceShape: 'round',
    eyeType: 'normal',
    eyeColor: '#000000',
    hairType: 'short',
    hairColor: '#000000',
    beardType: 'none',
    beardColor: '#000000',
    mouthType: 'smile',
    mouthColor: '#000000',
    noseType: 'medium',
    noseColor: '#000000',
    // Initialize other options
}
