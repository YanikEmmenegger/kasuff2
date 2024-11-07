// /src/components/quiz/WordScramble.tsx

import {useState} from 'react';
import {usePlayer} from '../../../../contexts/playerProvider.tsx';
import toast from 'react-hot-toast';
import {motion} from 'framer-motion';
import Input from '../../../Input.tsx';
import Button from '../../../Button.tsx';

const WordScramble: React.FC = () => {
    const {game, sendAnswer} = usePlayer();

    const [playerAnswer, setPlayerAnswer] = useState('');
    const [attempts, setAttempts] = useState<string[]>([]); // State to store all attempts
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeInput, setShakeInput] = useState(false); // State to control shake animation

    if (!game) {
        return <div className="text-center text-red-500">No game data available.</div>;
    }

    const currentQuestionIndex = game.currentRoundIndex;
    const currentRound = game.rounds?.[currentQuestionIndex];
    const currentQuestion = currentRound?.data as {
        type: 'word-scramble';
        word: string;
        scrambled: string;
    };

    if (!currentQuestion) {
        return <div className="text-center text-red-500">No current question available.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!playerAnswer.trim()) {
            toast.error('Please enter your answer.');
            return;
        }

        // Ensure the answer is lowercase
        const normalizedPlayerAnswer = playerAnswer.trim().toLowerCase();
        const correctAnswer = currentQuestion.word.toLowerCase();

        // Add the attempt to the attempts array
        const updatedAttempts = [...attempts, normalizedPlayerAnswer];
        setAttempts(updatedAttempts);

        if (normalizedPlayerAnswer !== correctAnswer) {
            // Incorrect answer
            // Trigger shake animation and clear input
            setShakeInput(true);
            setPlayerAnswer('');

            // Display an error message
            toast.error('Incorrect answer. Try again.');

            // Reset shake animation after it completes
            setTimeout(() => {
                setShakeInput(false);
            }, 500); // Duration of the shake animation

            return;
        }

        // Correct answer
        setIsSubmitting(true);

        try {
            await toast.promise(sendAnswer(updatedAttempts), {
                loading: 'Submitting your answer...',
                success: 'Answer submitted!',
                error: 'Error submitting your answer.',
            });
            setPlayerAnswer('');
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[90%] h-auto w-full flex items-center justify-center bg-cyan-500 text-gray-200 p-6">
            <motion.div
                className="max-w-md w-full bg-cyan-600 p-8 rounded-lg shadow-lg"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
                {/* Title */}
                <motion.div
                    className="flex justify-center items-center h-1/4 mb-6"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                >
                    <h2 className="text-4xl font-bold text-white text-center">Unscramble the Word!</h2>
                </motion.div>

                {/* Scrambled Word */}
                <motion.div
                    className="flex justify-center items-center mb-6"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                >
          <span className="text-3xl font-bold text-white bg-cyan-700 px-4 py-2 rounded">
            {currentQuestion.scrambled}
          </span>
                </motion.div>

                {/* Input Field */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={
                            shakeInput
                                ? {x: [-10, 10, -10, 10, 0], opacity: 1, y: 0}
                                : {opacity: 1, y: 0}
                        }
                        transition={{duration: 0.5}}
                    >
                        <Input
                            type="text"
                            value={playerAnswer}
                            onChange={(e) => setPlayerAnswer(e.target.value.toLowerCase())}
                            placeholder="Your answer"
                            className="bg-cyan-500 text-white placeholder-gray-300"
                            disabled={isSubmitting}
                        />
                    </motion.div>
                    <motion.div
                        className="w-full"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.8}}
                    >
                        <Button
                            type="submit"
                            className="w-full bg-green-500 hover:bg-green-700"
                            disabled={isSubmitting || !playerAnswer.trim()}
                        >
                            Submit Answer
                        </Button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default WordScramble;
