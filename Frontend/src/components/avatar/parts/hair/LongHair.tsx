import {FC, useEffect, useMemo, useState} from "react";
import {PartProps} from "../partProps";
import {calculateColor} from "../../avatarFunctions";

const LongHair: FC<PartProps> = ({color}) => {
    // Define the base colors and calculate the color variations
    const colorVars = useMemo(() => {
        return ["#923927", "#c57251", "#b1684b"];
    }, []);

    const newColors: string[] = calculateColor(colorVars, color);

    const [colors, setColors] = useState<string[]>(newColors);

    useEffect(() => {
        setColors(calculateColor(colorVars, color));
    }, [color, colorVars]);

    return (
        <g className="LongHair">
            <path
                d="M161.67,80.45c-11.51-3.19-24.17-7.46-32.29-15.84-7.08-7.31-10.49-16.8-12.41-26.23-3.57,10.57-14.36,19.12-24.02,25.39-16.23,10.53-35,17.42-53.24,24.54.2,22.34,1.98,47.33,10.41,68.43,5.14,12.88,13.63,25.17,28.29,30.34-22.92-4.17-32.83-24.23-37.36-43.16s-4.28-37.25-1.6-55.61l-22.95,7.5c23.67-11.2,48.75-20.37,71.11-33.73,11.25-6.72,23.39-14.98,29.89-25.87,2.75,8.61,6.57,17.1,12.94,24.06,12.74,13.91,33.13,17.59,50.7,24.42.08.58-.89.18-1.2.12-5.07-.96-13.51-3.03-18.28-4.35Z"
                fill={colors[0]}/>
            <path
                d="M116.04,4.52c2.04,1.32,2.39,2.92-.67,3.14s-10.43-1.56-14.41-1.69c-28.97-1-54.85,11.28-70.05,33.49-6.08,8.88-9.63,18.87-13.48,28.65-.12-.02-.65-1.89-.67-2.06-1.14-9.1,10.54-30.04,16.54-37.6C51,6.19,87.23-7.64,116.04,4.52Z"
                fill={colors[1]}/>
            <path
                d="M118.17,187.8c23.51-5.41,32.81-27.47,37.89-46.79,4.95-18.81,7.33-40.07,5.6-59.36.58-.61.79,1.48.8,1.57,3.91,30.87,4.69,101.78-44.3,104.58Z"
                fill={colors[0]}/>
            <path
                d="M119.77,190.95c-2.73-.43-5.57-2.13-8.01-3.26,1.92.25,3.67.18,5.6.12,12.76,2.68,26.22-3.86,34.42-12.45,9.38-9.83,14.4-24.51,16.28-37.24,1.03-7.02.31-16.05,1.6-22.49.07-.35-.14-.85.53-.48.57,20.88-.67,45.35-16.01,62.14-7.78,8.52-21.84,15.63-34.42,13.66Z"
                fill={colors[0]}/>
            <path
                d="M85.35,188.05c1.76-.15,3.57-.2,5.34-.36-2.36,1.16-5.34,2.84-8.01,3.26-12.15,1.93-25.85-4.87-33.62-12.94-16.3-16.92-17.45-41.94-16.81-63.35.68-.36.46.14.53.48,1.05,5.23.42,13.18,1.07,18.86,2.98,26.05,17.09,56.97,51.5,54.04Z"
                fill={colors[0]}/>
            <path
                d="M119.77,190.95c12.58,1.97,26.64-5.14,34.42-13.66,15.34-16.79,16.58-41.26,16.01-62.14-.68-.36-.46.14-.53.48-1.29,6.44-.57,15.47-1.6,22.49-1.87,12.73-6.9,27.41-16.28,37.24-8.2,8.59-21.66,15.13-34.42,12.45.26,0,.54.02.8,0,48.98-2.8,48.2-73.7,44.3-104.58-.01-.09-.22-2.18-.8-1.57-.04-.4.02-.81,0-1.21,4.77,1.32,13.21,3.39,18.28,4.35.31.06,1.28.45,1.2-.12-17.57-6.83-37.96-10.51-50.7-24.42-6.37-6.96-10.19-15.45-12.94-24.06-6.49,10.89-18.64,19.15-29.89,25.87-22.36,13.36-47.44,22.53-71.11,33.73l22.95-7.5c-2.68,18.36-2.74,37.46,1.6,55.61s14.44,38.99,37.36,43.16c2.26.41,4.64.75,6.94.97-34.41,2.92-48.52-27.99-51.5-54.04-.65-5.68-.02-13.63-1.07-18.86-.07-.35.14-.85-.53-.48-.64,21.41.51,46.43,16.81,63.35,7.77,8.06,21.47,14.86,33.62,12.94-10.4,3.84-23.5,6.25-33.49.24,5.2,5.34,14.54,7.41,22.15,8.22-17.28,2.28-39.5-1.93-50.83-14.87C3.61,165.25,5.08,126.93,6.36,103.3c1.43-26.41,8.15-54.08,26.95-74.83-6.01,7.56-17.68,28.5-16.54,37.6.02.17.55,2.03.67,2.06,3.85-9.78,7.4-19.77,13.48-28.65C46.11,17.26,71.99,4.97,100.96,5.98c3.98.14,11.21,1.93,14.41,1.69s2.71-1.83.67-3.14c1.32.56,5.91,3.33,6.27,3.39.65.1,5.17-1.32,6.4-1.45,29.45-3.14,52.72,34.33,59.91,55.97,9.05,27.27,12.95,89.87-1.87,115.09-10.9,18.55-33.08,24.19-54.97,21.76,7.39-1.07,15.96-2.68,21.21-7.86-10.17,5.62-22.87,3.41-33.22-.48Z"
                fill={colors[2]}/>
            <path
                d="M118.04,21.45c-6.93,22.83-31.83,36.96-54.17,46.42-14.31,6.06-29.66,10.05-43.36,17.29,9.6-7.38,21.66-10.82,32.69-15.84,24.68-11.23,52.17-24.49,64.84-47.87Z"
                fill={colors[0]}/>
            <path
                d="M19.57,107.04c1.09,17.05-.1,34.34,3.87,51.14,2.92,12.39,8.74,23.68,15.88,34.46-16.29-9.3-19.96-28.37-20.68-44.61-.6-13.62.08-27.41.93-40.98Z"
                fill={colors[0]}/>
            <path
                d="M95.89,11.78c4.14-.23,11.18-.18,15.21.48.38.06.93-.13.53.48-33.13-2.05-63.44,14.08-80.72,39.05C43.15,30.26,68.78,13.31,95.89,11.78Z"
                fill={colors[0]}/>
            <path
                d="M131.65,9.12c4.8-.95,14.24,3.45,18.41,5.8,23.93,13.51,37.84,45.3,40.29,69.88-7.83-21.6-17.21-48.07-38.96-61.42-2.36-1.45-5.68-3.35-8.27-4.35-3.43-1.33-13.12-2.57-13.74-6.65-.22-1.43.61-2.94,2.27-3.26Z"
                fill={colors[1]}/>
            <path
                d="M182.61,107.29c1.34,13.28,1.76,26.9,1.2,40.26-.69,16.43-4.11,35.66-20.68,45.09,5.4-8.62,10.66-17.37,13.74-26.96,6.08-18.92,5.29-38.85,5.74-58.39Z"
                fill={colors[0]}/>
            <path
                d="M123.64,32.09c3.52,12.19,10.6,23.58,22.95,29.98,7.81,4.05,16.67,5.69,25.48,6.89-25.37,2.03-46.49-13.86-48.43-36.87Z"
                fill={colors[0]}/>
            <path
                d="M133.25,22.42c16.28,5.83,30.22,16.61,39.36,30.1-2.75-2.43-4.87-5.41-7.47-7.98-9.15-9.03-20.12-16.17-31.89-22.12Z"
                fill={colors[0]}/>
        </g>
    )
}

export default LongHair;
