import {FC} from "react";
import {PartProps} from "../partProps.ts";

const FaceSquare: FC<PartProps> = ({color}) => {
    return (
        <rect x="10" y="10" width="180" height="180" fill={color}/>)

}

export default FaceSquare;
