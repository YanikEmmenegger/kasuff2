import {FC} from "react";
import {useNavigate} from "react-router";
import Button from "../Button.tsx";

interface QuestionTypeSelectorProps {
    questionTypes: string[];
}

const QuestionTypeSelector: FC<QuestionTypeSelectorProps> = ({questionTypes}) => {

    const navigate = useNavigate();

    return (
        <div className={"flex flex-col gap-5"}>
            {
                questionTypes.map((type, index) => (
                    <Button className={"bg-cyan-600"} key={"qType-" + index} onClick={() => navigate("?step=2&qType=" + type)}>
                        {type}
                    </Button>
                ))
            }
        </div>
    );
}

export default QuestionTypeSelector;
