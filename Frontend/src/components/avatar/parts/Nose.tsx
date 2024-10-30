// /src/components/avatar/parts/Nose/Nose.tsx

import React from 'react';

interface NoseProps {
    type: 'small' | 'medium' | 'large';
    color: string;
}

const Nose: React.FC<NoseProps> = ({type, color}) => {
    switch (type) {
        case 'small':
            return <circle cx="100" cy="120" r="5" fill={color}/>;
        case 'medium':
            return <circle cx="100" cy="120" r="7" fill={color}/>;
        case 'large':
            return <circle cx="100" cy="120" r="9" fill={color}/>;
        default:
            return null;
    }
};

export default Nose;
