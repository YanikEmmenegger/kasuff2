import React from 'react';
import {colorOptions} from "../variants.ts";

interface HatProps {
    variant: number;
    color: number;
}

export const Hat: React.FC<HatProps> = ({ variant, color }) => {
    const fillColor = colorOptions[color];

    switch (variant) {
        case 0: // Cap variant
            return <rect x="40" className={"cap"} y="10" width="70" height="30" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 1: // Beanie variant
            return <circle cx="75" cy="25" className={"beanie"} r="20" fill={fillColor} stroke="black" strokeWidth="2" />;
        case 2: // Fedora variant
            return <rect x="40" y="10" className={"fedora"} width="70" height="20" fill={fillColor} stroke="black" strokeWidth="2" />;
        default:
            return null;
    }
}
