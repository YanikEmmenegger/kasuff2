// /src/components/avatar/parts/FaceShape/FaceShape.tsx

import React from 'react';

interface FaceShapeProps {
    color: string;
    shape: 'round' | 'square' | 'oval';
}

const FaceShape: React.FC<FaceShapeProps> = ({color, shape}) => {
    switch (shape) {
        case 'round':
            return <circle cx="100" cy="100" r="80" fill={color}/>;
        case 'square':
            return <rect x="50" y="50" width="100" height="100" fill={color}/>;
        case 'oval':
            return <ellipse cx="100" cy="100" rx="80" ry="100" fill={color}/>;
        default:
            return null;
    }
};

export default FaceShape;
