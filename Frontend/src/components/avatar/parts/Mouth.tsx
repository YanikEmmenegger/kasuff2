// /src/components/avatar/parts/Mouth/Mouth.tsx

import React from 'react';

interface MouthProps {
    type: 'smile' | 'frown' | 'neutral';
    color: string;
}

const Mouth: React.FC<MouthProps> = ({type, color}) => {
    switch (type) {
        case 'smile':
            return <path d="M80,140 Q100,160 120,140" stroke={color} strokeWidth="3" fill="none"/>;
        case 'frown':
            return <path d="M80,150 Q100,130 120,150" stroke={color} strokeWidth="3" fill="none"/>;
        case 'neutral':
            return <line x1="80" y1="145" x2="120" y2="145" stroke={color} strokeWidth="3"/>;
        default:
            return null;
    }
};

export default Mouth;
