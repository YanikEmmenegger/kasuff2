import {FC, useEffect, useMemo, useState} from "react";
import {PartProps} from "../partProps";
import {calculateColor} from "../../avatarFunctions";

const MaleEyes: FC<PartProps> = ({color}) => {
    // Define the base colors and calculate the color variations
    const colorVars = useMemo(() => {
        return ["#946c67", "#75514d", "#342525", "#0a0709", "#513636"];
    }, []);

    const newColors: string[] = calculateColor(colorVars, color);

    const [colors, setColors] = useState<string[]>(newColors);

    useEffect(() => {
        setColors(calculateColor(colorVars, color));
    }, [color, colorVars]);

    return (
        <g className="Mustache">
            <path
                d="M178.5,128.21c1.02,1.75,1.87,4.65,1.61,6.64-.82,6.2-8.48,11.75-14.85,12.82,1.44-.69.48-1.34.3-2.49-10.33,2.76-21.47.62-31.51-2.21s-23.85-8.19-29.6-16.97c.13-.36.52-.51.8-.74,5.42-2.72,11.8-3.36,16.96.18,13.3,9.13,20.64,21.14,40.54,19.55,11.18-.9,22.05-10.43,11.74-19.46,1.62-.75,2.72,2.03,4.01,2.67Z"
                fill={colors[1]}/>
            <path
                d="M103.24,123.23c-.14,1.3.57,1.79,1.2,2.77,5.75,8.78,19.28,14.05,29.6,16.97s21.18,4.97,31.51,2.21c.18,1.15,1.14,1.8-.3,2.49,6.38-1.06,14.03-6.62,14.85-12.82.86.48.76,3.47.6,4.33-.23,1.26-3.37,5.32-4.42,6.45-16.82,18.27-54.53,8.6-69.64-7.38-2.32-2.45-3.94-5.31-6.12-7.84-10.45,18.81-42.47,30.29-63.82,22.87-6.96-2.42-16.87-10.02-16.16-17.43.01-.14.19-1.34.6-1.2.14,1.27.46,2,1,3.14,2.52,5.29,7.7,8.36,13.55,9.96-.56-1.23-2.37.07-1.51-2.12.57-1.44,2.98.07,4.32.28,15.28,2.36,48.93-6.1,57.7-18.72,1-1.44.36-1.48.4-1.57.03-.05-.03-.13,0-.18.1-.21,1.7-1.26,1.4-2.21.94.58,1.76,1.27,2.71,1.84.85-.62,1.61-1.28,2.51-1.84Z"
                fill={color[4]}/>
            <path
                d="M182.91,138.72c-.46-.31-.18-.62-.4.09-5.42,17.32-23.46,20.94-41.04,20.19-14.9-.63-31.28-5.56-40.94-16.41-11.04,12.76-31.69,17.16-48.77,16.41-15.06-.66-28.61-5.76-33.02-20.01-.22-.71.05-.4-.4-.09-.44-4.53.52-11.25,4.72-14.2,3.27-2.3,8.24-2.87,10.94.46.88,1.08,1.86,3.32,1.71,4.7-.46-1.06-1.65-2.42-2.91-2.77l1.4-.09c-.19-.72-.94-1.02-1.4-1.38-4.1-3.24-8.33-.57-10.24,3.32-.53,1.08-1.56,3.7-1.61,4.79-.02.5.18.69.2.92-.41-.15-.59,1.05-.6,1.2-.71,7.4,9.2,15.01,16.16,17.43,21.35,7.42,53.37-4.06,63.82-22.87,2.18,2.53,3.81,5.39,6.12,7.84,15.11,15.98,52.82,25.65,69.64,7.38,1.04-1.13,4.18-5.19,4.42-6.45.16-.87.26-3.85-.6-4.33.26-1.99-.58-4.88-1.61-6.64-2.02-3.46-7.2-5.88-10.14-2.21,8.94-1.72,9.48,9.56,4.01,14.02-10.94,8.93-27.84.14-37.13-6.64-9.99-7.29-16.83-18.63-30-8.11-.28.22-.67.38-.8.74-.64-.97-1.35-1.47-1.2-2.77,18.18-11.37,21.69.39,34.22,9.22,5,3.53,14.19,8.51,20.47,9.04,4.94.41,12.89-.63,15.55-5.07,3.6-5.99-3.63-14.1-7.93-6.36.23-6.54,6.83-9.46,12.64-5.35,4.14,2.93,5.13,9.54,4.72,14.02Z"
                fill={colors[2]}/>
            <path
                d="M182.91,138.72c-1.28,13.97-14.7,20.74-28.4,22.5-18.47,2.37-40.27-1.96-53.79-14.2-14.39,12.58-37.09,16.99-56.4,13.83-12.75-2.09-24.73-9.11-25.99-21.95.45-.3.18-.62.4.09,4.41,14.25,17.95,19.35,33.02,20.01,17.08.74,37.73-3.65,48.77-16.41,9.66,10.85,26.04,15.78,40.94,16.41,17.58.74,35.62-2.88,41.04-20.19.22-.71-.06-.4.4-.09Z"
                fill={colors[3]}/>
            <path
                d="M98.02,123.23c.29.95-1.3,2.01-1.4,2.21-12.84-11.5-22.09,1.92-31.81,8.85-9.1,6.48-23.96,13.61-34.92,6.45-6.33-4.13-6.64-15.65,2.91-15.12.46.36,1.22.67,1.4,1.38l-1.4.09c-5.51-1.5-7.31,6.09-4.62,9.87,6.47,9.08,23.75,2.77,31.41-1.75,14.54-8.59,18.73-24.21,38.43-11.99Z"
                fill={colors[2]}/>
            <path
                d="M96.61,125.62c-.05.09.6.13-.4,1.57-8.77,12.61-42.42,21.08-57.7,18.72-1.33-.21-3.75-1.71-4.32-.28-.87,2.19.95.89,1.51,2.12-5.85-1.6-11.03-4.67-13.55-9.96-.16-1.2-.31-3.23-1.2-4.06.05-1.1,1.08-3.72,1.61-4.79.21-.3,3.08-4.39,3.41-2.86-8.78,9.5,1.95,18.11,12.74,18.9,19.7,1.44,26.9-10.21,40.14-19.36,5.38-3.72,12.25-3.23,17.76,0Z"
                fill={colors[1]}/>
            <path
                d="M96.61,125.44c-.03.05.03.13,0,.18-5.51-3.23-12.38-3.72-17.76,0-13.24,9.15-20.44,20.81-40.14,19.36-10.79-.79-21.52-9.41-12.74-18.9-.33-1.53-3.2,2.55-3.41,2.86,1.9-3.89,6.14-6.56,10.24-3.32-9.55-.53-9.24,10.99-2.91,15.12,10.96,7.16,25.82.03,34.92-6.45,9.72-6.93,18.97-20.35,31.81-8.85Z"
                fill={colors[0]}/>
            <path d="M22.15,137.8c-.54-1.13-.87-1.87-1-3.14-.03-.24-.22-.43-.2-.92.89.83,1.04,2.85,1.2,4.06Z"
                  fill={colors[0]}/>
            <path
                d="M178.5,128.21c-1.3-.65-2.4-3.42-4.01-2.67,10.31,9.02-.56,18.56-11.74,19.46-19.9,1.6-27.24-10.42-40.54-19.55-5.16-3.54-11.54-2.9-16.96-.18,13.18-10.51,20.01.82,30,8.11,9.29,6.78,26.19,15.56,37.13,6.64,5.47-4.46,4.92-15.73-4.01-14.02,2.94-3.67,8.12-1.25,10.14,2.21Z"
                fill={colors[0]}/>
        </g>
    )
}

export default MaleEyes;


