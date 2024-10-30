// /src/components/avatar/parts/Beard/Beard.tsx

import React from 'react';

interface BeardProps {
    type: 'none' | 'mustache' | 'goatee' | 'full';
    color: string;
}

const Beard: React.FC<BeardProps> = ({type, color}) => {
    switch (type) {
        case 'mustache':
            return (
                <path
                    d="M80,130 Q100,140 120,130"
                    stroke={color}
                    strokeWidth="5"
                    fill="none"
                />
            );
        case 'goatee':
            return (
                <path
                    d="M90,150 L110,150 L110,160 L90,160 Z"
                    fill={color}
                />
            );
        case 'full':
            return (
                <path
                    d="M70,130 C80,160 120,160 130,130 Z"
                    fill={color}
                />
            );
        case 'none':
        default:
            return null;
    }
};

export default Beard;
