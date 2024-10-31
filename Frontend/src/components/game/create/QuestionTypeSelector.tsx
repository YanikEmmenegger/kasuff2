import {FC} from "react";
import {motion} from "framer-motion";
import {FaCheckCircle, FaListAlt, FaQuestionCircle, FaSortNumericDown} from "react-icons/fa";

interface QuestionTypeSelectorProps {
    selectedTypes: (
        | "multiple-choice"
        | "who-would-rather"
        | "what-would-you-rather"
        | "ranking"
        )[];
    onChange: (
        selectedTypes: (
            | "multiple-choice"
            | "who-would-rather"
            | "what-would-you-rather"
            | "ranking"
            )[]
    ) => void;
}

const questionTypes = [
    {
        type: "multiple-choice" as const,
        label: "Multiple Choice",
        icon: <FaListAlt/>,
    },
    {
        type: "who-would-rather" as const,
        label: "Who Would Rather",
        icon: <FaQuestionCircle/>,
    },
    {
        type: "what-would-you-rather" as const,
        label: "What Would You Rather",
        icon: <FaQuestionCircle/>,
    },
    // Uncomment if you want to include "ranking"
    {
        type: "ranking" as const,
        label: "Ranking",
        icon: <FaSortNumericDown/>,
    },
];

const QuestionTypeSelector: FC<QuestionTypeSelectorProps> = ({
                                                                 selectedTypes,
                                                                 onChange,
                                                             }) => {
    const handleToggle = (type: typeof questionTypes[number]["type"]) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter((t) => t !== type));
        } else {
            onChange([...selectedTypes, type]);
        }
    };

    return (
        <div className="p-4 rounded-lg border-2 border-cyan-600 w-full">
            <div className="flex flex-wrap gap-2">
                {questionTypes.map(({type, label, icon}) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                        <motion.button
                            key={type}
                            onClick={() => handleToggle(type)}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className={`flex w-full items-center px-4 py-2 rounded-lg cursor-pointer focus:outline-none transition-colors
                ${
                                isSelected
                                    ? "bg-cyan-800 text-white"
                                    : "bg-cyan-600 text-gray-800"
                            }`}
                        >
              <span
                  className={`flex items-center ${
                      isSelected ? "" : "opacity-50"
                  }`}
              >
                {icon}
              </span>
                            <span
                                className={`ml-2 ${
                                    isSelected ? "" : "line-through opacity-50"
                                }`}
                            >
                {label}
              </span>
                            {isSelected && (
                                <FaCheckCircle className="ml-2 text-white"/>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionTypeSelector;
