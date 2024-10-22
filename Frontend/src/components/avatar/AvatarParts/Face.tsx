import React from 'react';
import {colorOptions} from "../variants.ts";

interface FaceProps {
    variant: number;
    color: number;
}

export const Face: React.FC<FaceProps> = ({ variant, color }) => {
    const fillColor = colorOptions[color];

    switch (variant) {
        case 0: // Round face
            return <circle cx="75" cy="80" r="30" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 1: // Square face
            return <rect x="45" y="50" width="60" height="60" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 2: // Oval face
            return <ellipse cx="75" cy="80" rx="35" ry="45" fill={fillColor} stroke="black" strokeWidth="2" />;
        default:
            return null;
    }
};
