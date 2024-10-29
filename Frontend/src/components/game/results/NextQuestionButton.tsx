import {usePlayer} from "../../../contexts/playerProvider.tsx";
import Button from "../../Button.tsx";

const NextQuestionButton = () => {
    const {nextQuestion, game, player} = usePlayer();

    const handleClick = async () => {
        try {
            await nextQuestion();
        } catch (e) {
            console.error(e);
        }
    }

    // Check if the game exists and if the player is the game creator
    if (!game || player?._id !== game.creatorId || game.state !== 'results') {
        return null; // Do not render the button if conditions are not met
    }

    return (
        <div className="flex flex-col">
            <Button
                className="bg-green-500 hover:bg-green-600"
                onClick={handleClick}
            >
                Continue
            </Button>
        </div>
    );
}

export default NextQuestionButton;
