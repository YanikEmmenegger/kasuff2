// /src/components/avatar/parts/Eyes/Eyes.tsx

import React from 'react';

interface EyesProps {
    type: 'normal' | 'happy' | 'sleepy';
    color: string;
}

const Eyes: React.FC<EyesProps> = ({type, color}) => {
    switch (type) {
        case 'normal':
            return (
                <>
                    <circle cx="70" cy="80" r="10" fill={color}/>
                    <circle cx="130" cy="80" r="10" fill={color}/>
                </>
            );
        case 'happy':
            return (
                <>
                    <path d="M60,80 Q70,70 80,80" stroke={color} strokeWidth="3" fill="none"/>
                    <path d="M120,80 Q130,70 140,80" stroke={color} strokeWidth="3" fill="none"/>
                </>
            );
        case 'sleepy':
            return (
                <>
                    <line x1="60" y1="80" x2="80" y2="80" stroke={color} strokeWidth="3"/>
                    <line x1="120" y1="80" x2="140" y2="80" stroke={color} strokeWidth="3"/>
                </>
            );
        default:
            return null;
    }
};

export default Eyes;
