// /src/components/avatar/parts/Hair/Hair.tsx

import React from 'react';

interface HairProps {
    type: 'short' | 'long' | 'bald';
    color: string;
}

const Hair: React.FC<HairProps> = ({type, color}) => {
    switch (type) {
        case 'short':
            return (
                <path
                    d="M50,50 C60,30 140,30 150,50 L150,70 C140,50 60,50 50,70 Z"
                    fill={color}
                />
            );
        case 'long':
            return (
                <path
                    d="M50,50 C60,30 140,30 150,50 L150,120 C140,100 60,100 50,120 Z"
                    fill={color}
                />
            );
        case 'bald':
            return null; // No hair drawn
        default:
            return null;
    }
};

export default Hair;
