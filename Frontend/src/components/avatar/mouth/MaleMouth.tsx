import {FC, useEffect, useMemo, useState} from "react";
import {PartProps} from "../parts/partProps.ts";
import {calculateColor} from "../avatarFunctions.ts";


const MaleMouth: FC<PartProps> = ({color}) => {
    // Define the base colors and calculate the color variations
    const colorVars = useMemo(() => {
        return ["#a11619", "#f34d42", "#e8998d"];
    }, []);

    const newColors: string[] = calculateColor(colorVars, color);

    const [colors, setColors] = useState<string[]>(newColors);

    useEffect(() => {
        setColors(calculateColor(colorVars, color));
    }, [color, colorVars]);

    return (
        <g className="MaleMouth">
            <g id="Generative_Object">
                <path
                    d="M83.49,142.09c1.68-.49.5,1.83-.21,2.26l.13.13c10.73,3.45,22.63,3.58,33.37.09l.13-.13c-.44-.35-1.93-2.06-.81-2.35.73-.19,1.42,1.14,1.96,1.62.62.54,2.18,1.19,1.92,2.01-.31.99-2.04-.39-2.43-.73-2.24,3.9-5.3,7.78-9.3,9.99-10.2,5.62-20.37-1.06-25.43-10.07-.22-.09-1.65,1.46-2.39,1.11-1.34-.63,1.16-1.9,1.62-2.3.29-.25,1.31-1.58,1.45-1.62Z"
                    fill={colors[2]}/>
                <path
                    d="M86.77,146.1c1.4,1.51,3.32,2.63,5.25,3.33,6.89,2.5,16.22,1.88,21.72-3.33.25-.07,2.92-1.05,2.99-.9-2.42,4.23-5.79,7.99-10.33,9.94-3.2-2.85-9.08-2.87-12.37-.17-4.45-2-7.83-5.71-10.41-9.77,0-.14.4-.06.47-.04.8.17,1.86.72,2.69.94Z"
                    fill={colors[0]}/>
                <path
                    d="M113.74,146.1c-5.5,5.21-14.83,5.83-21.72,3.33-1.93-.7-3.85-1.81-5.25-3.33,8.34,2.19,18.63,2.2,26.97,0Z"
                    fill={"#ffffff"}/>
                <path d="M105.72,155.49c-3.69,1.36-7.36,1.25-11.01-.17,2.86-2.34,8.26-2.38,11.01.17Z" fill={colors[1]}/>
                <path
                    d="M106.4,155.15c-.22.1-.45.26-.68.34-2.75-2.55-8.15-2.51-11.01-.17-.23-.09-.45-.24-.68-.34,3.29-2.7,9.18-2.68,12.37.17Z"
                    fill={colors[1]}/>
            </g>
        </g>

    )
}

export default MaleMouth;




