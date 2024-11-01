import {PartProps} from "../partProps.ts";
import {FC} from "react";


const FaceRound: FC<PartProps> = ({color}) => {
    return (
        <circle cx="100" cy="100" r="90" fill={color}/>
    )

}

export default FaceRound;
