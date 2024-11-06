import {FC, useState} from "react";
import toast from "react-hot-toast";
import {usePlayer} from "../../../contexts/playerProvider.tsx";
import Input from "../../Input.tsx";
import Button from "../../Button.tsx";
import {useNavigate} from "react-router";
import {motion} from "framer-motion";

interface JoinGameFormProps {
    _gameCode?: string;
}

const JoinGameForm: FC<JoinGameFormProps> = ({_gameCode}) => {
    const navigate = useNavigate();
    const {joinGame} = usePlayer(); // Use socket context

    // Initialize gameCode as uppercase if _gameCode is provided
    const [gameCode, setGameCode] = useState<string>(_gameCode ? _gameCode.toUpperCase() : "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!gameCode) {
            toast.error("Please enter a game code");
            return;
        }

        await toast.promise(
            joinGame(gameCode),
            {
                loading: 'Joining game...',
                success: 'Successfully joined game!',
                error: 'Failed to join game, check the code and try again.',
            }
        );
    };

    // Handler to ensure input is always uppercase
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGameCode(e.target.value.toUpperCase());
    };

    return (
        <div className="flex items-center justify-center bg-cyan-500 text-gray-200 p-6">
            <motion.div
                className="max-w-md w-full bg-cyan-600 p-8 rounded-lg shadow-lg"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                >
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">Join a Game</h2>
                </motion.div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Input for entering game code */}
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.4}}
                    >
                        <Input
                            maxLength={10}
                            className="bg-cyan-500 text-white placeholder-gray-300 uppercase" // Added 'uppercase' class
                            type="text"
                            id="gameCode"
                            value={gameCode}
                            onChange={handleChange} // Updated handler to enforce uppercase
                            placeholder="Enter game code"
                        />
                    </motion.div>
                    <motion.div
                        className="w-full"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.6}}
                    >
                        {/* Submit button */}
                        <Button className="w-full bg-green-500 hover:bg-green-700" type="submit">
                            Join Game
                        </Button>
                    </motion.div>
                </form>
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.8}}
                >
                    <Button
                        className="mt-3 w-full bg-gray-600 hover:bg-gray-700 text-gray-200"
                        onClick={() => navigate('/')}
                    >
                        Back
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default JoinGameForm;
