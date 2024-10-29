import React from 'react';
import { colorOptions } from '../variants';

interface BodyProps {
    variant: number;
    color: number;
}

export const Body: React.FC<BodyProps> = ({ variant, color }) => {
    const fillColor = colorOptions[color];

    switch (variant) {
        case 0: // Slim body
            return <rect x="50" y="130" width="50" height="90" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 1: // Athletic body
            return <rect x="40" y="130" width="70" height="90" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 2: // Broad body
            return <rect x="35" y="130" width="80" height="90" fill={fillColor} stroke="black" strokeWidth="2" />;
        default:
            return null;
    }
};
