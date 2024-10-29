import {FC, useState} from "react";
import toast from "react-hot-toast";
import {usePlayer} from "../../../contexts/playerProvider.tsx";
import Input from "../../Input.tsx";
import Button from "../../Button.tsx";

interface JoinGameFormProps {
    _gameCode?: string;
}

const JoinGameForm: FC<JoinGameFormProps> = ({_gameCode}) => {
    const {joinGame} = usePlayer(); // Use socket context
    const [gameCode, setGameCode] = useState<string>(_gameCode || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!gameCode) {
            toast.error("Please enter a game code");
            return;
        }

        await toast.promise(
            joinGame(gameCode), // Correct key is "name" instead of "newName"
            {
                loading: 'Joining game...',
                success: 'Successfully joined game!',
                error: 'Failed to join game, check the code and try again.',
            }
        );
    };

    return (
        <div className="w-screen min-h-screen flex justify-center items-center">
            <div className="p-8 rounded-lg shadow-lg bg-gray-800 max-w-md w-full">
                <h2 className="text-4xl font-bold text-white mb-8 text-center">Join a Game</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Input for entering game code */}
                    <Input
                        maxLength={10}
                        type="text"
                        id="gameCode"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        placeholder="Enter game code"
                    />

                    {/* Submit button */}
                    <Button className={"bg-green-500 hover:bg-green-700"} type="submit">
                        Join Game
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default JoinGameForm;
