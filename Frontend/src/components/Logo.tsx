import {FC} from "react";

interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: FC<LogoProps> = ({ width, height }) => {
    return (
        <img
            src="https://placehold.co/600x400" // Update this with the actual path to your logo
            alt="Logo"
            width={width || 300}
            height={height || 300}
        />
    );
};

export default Logo;
