import {FC, useState} from "react";
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    Droppable,
    DroppableProvided,
    DropResult,
} from "@hello-pangea/dnd";
import {usePlayer} from "../../../contexts/playerProvider";
import {RankingQuestion} from "../../../types";
import toast from "react-hot-toast";
import {v4 as uuidv4} from "uuid";

interface RankingProps {
    question: RankingQuestion;
}

interface OptionItem {
    id: string;
    content: string;
    colorClass: string;
}

const Ranking: FC<RankingProps> = ({question}) => {
    const {sendAnswer, game} = usePlayer();

    // Function to map player ID to name
    const mapOptionToPlayerName = (playerId: string) => {
        const player = game?.players.find((p) => p._id === playerId);
        return player ? player.name : playerId; // Fallback to playerId if player is not found
    };


    // Define color classes
    const colorClasses = [
        "bg-blue-500",
        "bg-green-500",
        "bg-red-500",
        "bg-amber-500",
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
    ];

    // Initialize options with stable colors
    const [options, setOptions] = useState<OptionItem[]>(() => {
        const initialOptions: OptionItem[] = question.options.map((option, index) => ({
            id: uuidv4(),
            content: mapOptionToPlayerName(option),
            colorClass: colorClasses[index % colorClasses.length],
        }));
        return initialOptions.sort(() => Math.random() - 0.5);
    });

    const [answered, setAnswered] = useState(false);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const reorderedOptions = Array.from(options);
        const [movedOption] = reorderedOptions.splice(result.source.index, 1);
        reorderedOptions.splice(result.destination.index, 0, movedOption);

        setOptions(reorderedOptions);
    };

    const handleSubmit = async () => {
        if (answered) return;

        setAnswered(true);

        // Extract the ordered list of content
        const orderedOptions = options.map((option) => option.content);

        try {
            await toast.promise(sendAnswer(orderedOptions), {
                loading: "Submitting your ranking...",
                success: "Ranking submitted!",
                error: "Failed to submit ranking.",
            });
        } catch (error) {
            console.error("Error submitting ranking:", error);
            setAnswered(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col text-gray-200 bg-cyan-500">
            {/* Question section */}
            <div className="flex justify-center items-center h-1/4 p-6">
                <h2 className="md:text-4xl text-2xl font-bold text-center">
                    {question.question}
                </h2>
            </div>

            {/* Options section */}
            <div className="flex-1 p-6 overflow-y-auto">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="rankingOptions">
                        {(provided: DroppableProvided) => (
                            <div
                                className="space-y-4"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {options.map((option, index) => (
                                    <Draggable
                                        key={option.id}
                                        draggableId={option.id}
                                        index={index}
                                        isDragDisabled={answered}
                                    >
                                        {(
                                            provided: DraggableProvided,
                                            snapshot: DraggableStateSnapshot
                                        ) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                /*** Apply the draggableProps.style here ***/
                                                style={provided.draggableProps.style}
                                                className={`
                          p-4 rounded-lg ${option.colorClass}
                          text-white font-semibold flex items-center justify-between
                          ${snapshot.isDragging ? "shadow-lg" : "shadow"}
                        `}
                                            >
                                                <span>{option.content}</span>
                                                <span className="text-sm">Position {index + 1}</span>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Submit Button */}
            <div className="p-6">
                <button
                    onClick={handleSubmit}
                    disabled={answered}
                    className={`w-full bg-green-500 hover:bg-green-600 text-gray-200 py-3 rounded-lg font-semibold transition duration-300 ${
                        answered ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {answered ? "Ranking Submitted" : "Submit Ranking"}
                </button>
            </div>
        </div>
    );
};

export default Ranking;
