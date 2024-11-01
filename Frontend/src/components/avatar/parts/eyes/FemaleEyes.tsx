import {FC, useEffect, useMemo, useState} from "react";
import {PartProps} from "../partProps";
import {calculateColor} from "../../avatarFunctions";

const FemaleEyes: FC<PartProps> = ({color}) => {
    // Define the base colors and calculate the color variations
    const colorVars = useMemo(() => {
        return ["#2c2b2d", "#565556", "#565556"];
    }, []);

    const newColors: string[] = calculateColor(colorVars, color);

    const [colors, setColors] = useState<string[]>(newColors);

    useEffect(() => {
        setColors(calculateColor(colorVars, color));
    }, [color, colorVars]);

    return (
        <g className="WomenEyes">
            <g className="Eye">
                <path d="M135.69,85.66c4.21.69,8.32,3.45,10.43,7.2-3.15-3-6.38-5.5-10.43-7.2Z" fill={"#161516"}/>
                <path
                    d="M128.81,82.65c.71-.06,1.95-.13,2.58.22-9.82.85-17.66,7.83-22.58,15.91,7.99-7.49,18.76-16.07,30.1-9.89,4.38,2.39,7.4,8.95,13.12,5.16,1.01.45-3.02,2.89-3.66,2.37,2.04,1.08,5.48-.45,7.53-1.51-1.41,2.72-4.32,4.15-7.2,4.62h7.31c-3.07,1.77-6.88,2.74-10.43,2.04l-.86,4.95-.43-3.66-1.29,4.3v-2.58c-10.52,11.11-27.44,7.95-34.73-5.05,3.4-7.34,11.95-16.1,20.54-16.88Z"
                    fill={"#161516"}/>
                <path
                    d="M120.96,101.79c.05.81.17,1,.43,1.72,2.5,7.05,12.06,5.71,14.19-.65.76-2.27-.25-1.08-1.51-2.47-2.4-2.67-1.04-5.7,2.15-6.67l-1.61-2.04.22-.43c4.4,1.97,6.61,6.07,9.57,9.57-9.3,14.42-27.2,12.19-35.91-1.51l14.08-7.63-.75,2.04c5.38,1.01,3.8,6.62-.97,6.99-.42.37.1,1.02.11,1.08Z"
                    fill={"#ffffff"}/>
                <path
                    d="M135.37,102.65c-.02.16.05.24.22.22-2.13,6.35-11.69,7.7-14.19.65l.22-.54c3.79,4.57,9.34,1.34,13.76-.32Z"
                    fill={colors[0]}/>
                <path
                    d="M135.37,102.65c-4.42,1.66-9.97,4.89-13.76.32l-.22.54c-.26-.72-.38-.91-.43-1.72,1.52-.54,3.5,2.08,4.84,2.37.37.08,2.4.07,2.8,0,.86-.16,7.1-4.87,6.77-1.51Z"
                    fill={colors[1]}/>
                <path
                    d="M126.23,73.62c10.42-.69,20.32,4.03,23.76,14.3-1.05-1.07-1.62-2.68-2.58-3.87-5.63-6.93-14.41-8.12-22.69-5.91-2.57.68-17.28,7.72-18.28,7.1,2.85-6.68,12.87-11.15,19.78-11.61Z"
                    fill={"#161516"}/>
            </g>
            <g className="Eye">
                <path d="M64.31,85.66c-4.21.69-8.32,3.45-10.43,7.2,3.15-3,6.38-5.5,10.43-7.2Z" fill={"#161516"}/>
                <path
                    d="M71.19,82.65c-.71-.06-1.95-.13-2.58.22,9.82.85,17.66,7.83,22.58,15.91-7.99-7.49-18.76-16.07-30.1-9.89-4.38,2.39-7.4,8.95-13.12,5.16-1.01.45,3.02,2.89,3.66,2.37-2.04,1.08-5.48-.45-7.53-1.51,1.41,2.72,4.32,4.15,7.2,4.62h-7.31c3.07,1.77,6.88,2.74,10.43,2.04l.86,4.95.43-3.66,1.29,4.3v-2.58c10.52,11.11,27.44,7.95,34.73-5.05-3.4-7.34-11.95-16.1-20.54-16.88Z"
                    fill={"#161516"}/>
                <path
                    d="M79.04,101.79c-.05.81-.17,1-.43,1.72-2.5,7.05-12.06,5.71-14.19-.65-.76-2.27.25-1.08,1.51-2.47,2.4-2.67,1.04-5.7-2.15-6.67l1.61-2.04-.22-.43c-4.4,1.97-6.61,6.07-9.57,9.57,9.3,14.42,27.2,12.19,35.91-1.51l-14.08-7.63.75,2.04c-5.38,1.01-3.8,6.62.97,6.99.42.37-.1,1.02-.11,1.08Z"
                    fill={"#ffffff"}/>
                <path
                    d="M64.63,102.65c.02.16-.05.24-.22.22,2.13,6.35,11.69,7.7,14.19.65l-.22-.54c-3.79,4.57-9.34,1.34-13.76-.32Z"
                    fill={colors[0]}/>
                <path
                    d="M64.63,102.65c4.42,1.66,9.97,4.89,13.76.32l.22.54c.26-.72.38-.91.43-1.72-1.52-.54-3.5,2.08-4.84,2.37-.37.08-2.4.07-2.8,0-.86-.16-7.1-4.87-6.77-1.51Z"
                    fill={colors[1]}/>
                <path
                    d="M73.77,73.62c-10.42-.69-20.32,4.03-23.76,14.3,1.05-1.07,1.62-2.68,2.58-3.87,5.63-6.93,14.41-8.12,22.69-5.91,2.57.68,17.28,7.72,18.28,7.1-2.85-6.68-12.87-11.15-19.78-11.61Z"
                    fill={"#161516"}/>
            </g>
        </g>

    )
}

export default FemaleEyes;






