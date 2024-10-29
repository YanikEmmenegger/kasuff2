import React from 'react';
import {colorOptions} from '../variants';

interface PantsProps {
    variant: number;
    color: number;
}

export const Pants: React.FC<PantsProps> = ({variant, color}) => {
    const fillColor = colorOptions[color];

    switch (variant) {
        case 0: // Jeans
            return <rect x="35" y="220" width="80" height="60" fill={fillColor} stroke="black" strokeWidth="2"/>;
        case 1: // Shorts
            return <rect x="35" y="240" width="80" height="40" fill={fillColor} stroke="black" strokeWidth="2"/>;
        case 2: // Cargo pants
            return (
                <>
                    <rect x="35" y="220" width="80" height="60" fill={fillColor} stroke="black" strokeWidth="2"/>
                    <rect x="45" y="240" width="20" height="20" fill="gray" stroke="black" strokeWidth="2"/>
                    {/* Pocket */}
                    <rect x="85" y="240" width="20" height="20" fill="gray" stroke="black" strokeWidth="2"/>
                    {/* Pocket */}
                </>
            );
        default:
            return null;
    }
};
