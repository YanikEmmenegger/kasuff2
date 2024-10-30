import {FC} from "react";

interface ColoredBackgroundProps {
    children?: React.ReactNode;
}

const ColoredBackground: FC<ColoredBackgroundProps> = ({children}) => {



    return (
        <div
            className={"bg-cyan-500 w-full min-h-screen h-auto flex items-center justify-center"}>
            {children}
        </div>
    )
}

export default ColoredBackground;
