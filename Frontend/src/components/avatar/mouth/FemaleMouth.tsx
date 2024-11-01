import {FC, useEffect, useMemo, useState} from "react";
import {PartProps} from "../parts/partProps.ts";
import {calculateColor} from "../avatarFunctions.ts";


const FemaleMouth: FC<PartProps> = ({color}) => {
    // Define the base colors and calculate the color variations
    const colorVars = useMemo(() => {
        return ["#4c4d4d", "#333434"];
    }, []);

    const newColors: string[] = calculateColor(colorVars, color);

    const [colors, setColors] = useState<string[]>(newColors);

    useEffect(() => {
        setColors(calculateColor(colorVars, color));
    }, [color, colorVars]);

    return (
        <g className="FemaleMouth">
            <path
                d="M112.22,147.74c-9.91,5.58-13.67,5.29-23.44-.22,4.14-1.64,8.85-5.43,13.44-4.73,2.82.43,6.6,4.7,10,4.95Z"
                fill={colors[0]}/>
            <path
                d="M110.5,150.54c-3.06,4.71-5.65,8.33-11.93,7.53-2.68-.34-7.78-4.82-8.06-7.74,6.58,2.78,13.33,2.91,20,.22Z"
                fill={colors[0]}/>
            <path
                d="M88.78,147.53c9.77,5.5,13.53,5.79,23.44.22.91-.51,3.67-2.88,4.09-1.61.46,1.41-4.55,3.9-5.81,4.41-6.67,2.7-13.42,2.56-20-.22-.97-.41-6.75-3.11-5.59-4.41.94-.62,2.7.95,3.87,1.61Z"
                fill={"#161516"}/>
        </g>

    )
}

export default FemaleMouth;




