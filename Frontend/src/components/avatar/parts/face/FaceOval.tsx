import {FC} from "react";
import {PartProps} from "../partProps.ts";


const FaceRound: FC<PartProps> = ({color}) => {
    return (
        <ellipse cx="100" cy="100" rx="80" ry="90" fill={color}/>
    )

}
export default FaceRound;
