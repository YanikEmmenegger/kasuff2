// QuestionTypeSelector.tsx

import {FC} from "react";
import {motion} from "framer-motion";
import {FaCheckCircle, FaListAlt, FaQuestionCircle, FaSearch, FaSortNumericDown,} from "react-icons/fa";
import {FaMemory} from "react-icons/fa6"; // Ensure correct import path
import Button from "../../Button";
import {GameModeType} from "../../../types";
import {BsSearch} from "react-icons/bs";
import {SlEqualizer} from "react-icons/sl";
import {PiPasswordLight} from "react-icons/pi";
import {CiText} from "react-icons/ci"; // Import GameModeType

interface QuestionTypeSelectorProps {
    selectedTypes: GameModeType[];
    onChange: (selectedTypes: GameModeType[]) => void;
}

const questionTypes: {
    type: GameModeType;
    label: string;
    icon: JSX.Element;
    disabled?: boolean;
}[] = [
    {
        type: "multiple-choice",
        label: "Multiple Choice",
        icon: <FaListAlt/>,
    },
    {
        type: "who-would-rather",
        label: "Who Would Rather",
        icon: <FaQuestionCircle/>,
    },
    {
        type: "what-would-you-rather",
        label: "What Would You Rather",
        icon: <FaQuestionCircle/>,
    },
    {
        type: "ranking",
        label: "Ranking",
        icon: <FaSortNumericDown/>,
    },
    {
        type: "hide-and-seek",
        label: "Hide and Seek",
        icon: <FaSearch/>,
    },
    {
        type: "memory",
        label: "Memory",
        icon: <FaMemory/>,
    },
    {
        type: "sequence-memory",
        label: "Sequence",
        icon: <SlEqualizer/>,
        disabled: true,
    },
    {
        type: "word-scramble",
        label: "Word Scramble",
        icon: <CiText/>,
    },
    {
        type: "code-breaker",
        label: "Code Breaker",
        icon: <PiPasswordLight/>,
    },
    {
        type: "spy",
        label: "Spy ",
        icon: <BsSearch/>,
    },
];

const QuestionTypeSelector: FC<QuestionTypeSelectorProps> = ({selectedTypes, onChange}) => {
    const handleToggle = (type: GameModeType) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter((t) => t !== type));
        } else {
            onChange([...selectedTypes, type]);
        }
    };

    const handleSelectAll = () => {
        const enabledTypes = questionTypes
            .filter(({disabled}) => !disabled)
            .map(({type}) => type);
        onChange(enabledTypes);
    };

    const handleDeselectAll = () => {
        onChange([]);
    };

    return (
        <div className="p-4 rounded-lg border-2 border-cyan-600 w-full">
            <div className="flex gap-4 mb-4">
                <Button
                    onClick={handleSelectAll}
                    className="bg-cyan-500 hover:bg-cyan-700 transition-colors"
                >
                    Select All
                </Button>
                <Button
                    onClick={handleDeselectAll}
                    className="bg-cyan-500 hover:bg-cyan-700 transition-colors"
                >
                    Deselect All
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {questionTypes.map(({type, label, icon, disabled}) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                        <motion.button
                            disabled={disabled}
                            key={type}
                            onClick={() => handleToggle(type)}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className={`flex items-center px-4 py-2 rounded-lg cursor-pointer focus:outline-none transition-colors w-full ${
                                isSelected
                                    ? "bg-cyan-800 text-white"
                                    : "bg-cyan-600 text-gray-800"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <span className={`flex items-center ${isSelected ? "" : "opacity-50"}`}>
                                {icon}
                            </span>
                            <span className={`ml-2 ${isSelected ? "" : "line-through opacity-50"}`}>
                                {label}
                            </span>
                            {isSelected && <FaCheckCircle className="ml-2 text-white"/>}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionTypeSelector;
