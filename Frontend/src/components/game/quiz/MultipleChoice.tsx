import {FC, useState} from "react";
import {MultipleChoiceQuestion} from "../../../types";
import QuizButton from "./QuizButton";
import {motion} from "framer-motion";

interface MultipleChoiceProps {
    question: MultipleChoiceQuestion;
}

const MultipleChoice: FC<MultipleChoiceProps> = ({question}) => {
    const [answered, setAnswered] = useState(false);

    // Colors for each option
    const colors = ["blue", "green", "red", "amber", "indigo"];
    //random sort options to avoid bias
    question.options.sort(() => Math.random() - 0.5);

    return (
        <div className="h-screen w-full flex flex-col text-gray-200 bg-cyan-500">
            {/* Question section */}
            <motion.div
                className="flex justify-center items-center h-1/3 p-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.6}}
            >
                <h2 className="md:text-4xl text-2xl font-bold text-center">
                    {question.question}
                </h2>
            </motion.div>

            {/* Options section */}
            <motion.div
                className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.2, duration: 0.6}}
            >
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
            </motion.div>
        </div>
    );
};

export default MultipleChoice;
