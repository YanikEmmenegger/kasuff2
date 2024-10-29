import {FC} from "react";

interface QuestionTypeSelectorProps {
    selectedTypes: ("multiple-choice" | "who-would-rather" | "what-would-you-rather" | "ranking")[];
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
    "multiple-choice",
    "who-would-rather",
    "what-would-you-rather",
    //"ranking",
] as const;

const QuestionTypeSelector: FC<QuestionTypeSelectorProps> = ({selectedTypes, onChange}) => {
    const handleToggle = (type: typeof questionTypes[number]) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter((t) => t !== type));
        } else {
            onChange([...selectedTypes, type]);
        }
    };

    return (
        <div className="p-4 rounded-lg border-2 border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Select Question Types</h3>
            <div className="flex flex-col space-y-2">
                {questionTypes.map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleToggle(type)}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="text-white capitalize">{type.replace("-", " ")}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionTypeSelector;
