import {FC, useState} from "react";
import {MultipleChoiceQuestion} from "../../../types.ts";
import QuizButton from "./QuizButton.tsx";

interface MultipleChoiceProps {
    question: MultipleChoiceQuestion;
}

const MultipleChoice: FC<MultipleChoiceProps> = ({question}) => {

    const [answered, setAnswered] = useState(false)


    // Colors for each option
    const colors = ["blue", "green", "yellow", "red", "amber", "indigo"];
    return (
        <div className="h-screen w-screen flex flex-col text-white">
            {/* Question section (1/3 of the height) */}
            <div className="flex justify-center items-center h-1/3 p-6">
                <h2 className="md:text-4xl text-xl font-bold text-center">{question.question}</h2>
            </div>

            {/* Options section (2/3 of the height) */}
            <div className="h-2/3 p-6 grid grid-cols-2 gap-6">
                {question.options.map((option, index) => (
                    <QuizButton
                        disabled={answered}
                        onAnswer={() => setAnswered(true)}
                        key={index}
                        option={option}
                        text={option}
                        color={colors[index % colors.length]} // Cycle through colors
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default MultipleChoice;
