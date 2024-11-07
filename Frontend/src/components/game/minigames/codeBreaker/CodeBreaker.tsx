// /src/components/quiz/CodeBreakerGame.tsx

import {useEffect, useState} from 'react';
import {usePlayer} from '../../../../contexts/playerProvider.tsx';
import toast from 'react-hot-toast';
import {motion} from 'framer-motion';
import Input from '../../../Input.tsx';

const CodeBreakerGame: React.FC = () => {
    const {game, sendAnswer} = usePlayer();

    const [playerGuess, setPlayerGuess] = useState('');
    const [attempts, setAttempts] = useState<string[]>([]); // Stores all attempts
    const [revealedCode, setRevealedCode] = useState<(string | null)[]>([]); // Tracks revealed digits
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeInput, setShakeInput] = useState(false); // Controls shake animation

    const currentQuestionIndex = game!.currentRoundIndex;
    const currentRound = game!.rounds?.[currentQuestionIndex];
    const currentQuestion = currentRound?.data as {
        type: 'code-breaker';
        code: string;
    };


    // Initialize revealedCode based on code length
    useEffect(() => {
        if (revealedCode.length === 0 && currentQuestion.code) {
            setRevealedCode(Array(currentQuestion.code.length).fill(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion.code]);

    useEffect(() => {
        if (
            playerGuess.length === currentQuestion.code.length &&
            !isSubmitting &&
            playerGuess.trim() !== ''
        ) {
            handleAutoSubmit(playerGuess);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerGuess]);
    if (!currentQuestion) {
        return <div className="text-center text-red-500">No current question available.</div>;
    }

    if (!game) {
        return <div className="text-center text-red-500">No game data available.</div>;
    }


    const handleAutoSubmit = async (guess: string) => {
        const normalizedGuess = guess.trim();
        const correctCode = currentQuestion.code;

        // Add the guess to the attempts array
        const updatedAttempts = [...attempts, normalizedGuess];
        setAttempts(updatedAttempts);

        // Evaluate the guess
        const feedback = evaluateGuess(normalizedGuess, correctCode);

        // Update revealedCode for correct digits in correct positions
        const newRevealedCode = [...revealedCode];
        feedback.forEach((item, index) => {
            if (item.status === 'correct') {
                newRevealedCode[index] = item.value;
            }
        });
        setRevealedCode(newRevealedCode);

        if (normalizedGuess !== correctCode) {
            // Incorrect guess
            setShakeInput(true);
            setPlayerGuess('');
            toast.error('Incorrect guess. Try again.');

            // Reset shake animation after it completes
            setTimeout(() => {
                setShakeInput(false);
            }, 500); // Duration matches the animation
            return;
        }

        // Correct guess
        setIsSubmitting(true);

        try {
            await toast.promise(sendAnswer(updatedAttempts), {
                loading: 'Submitting your guesses...',
                success: 'Congratulations! You cracked the code!',
                error: 'Error submitting your guesses.',
            });
            setPlayerGuess('');
            // Optionally, navigate to a results page or reset the game
        } catch (error) {
            console.error('Error submitting guesses:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to evaluate the guess against the secret code
    const evaluateGuess = (guess: string, code: string) => {
        const result: { value: string; status: 'correct' | 'present' | 'absent' }[] = [];
        const codeDigits = code.split('');
        const guessDigits = guess.split('');

        const codeMatched = Array(codeDigits.length).fill(false);
        const guessMatched = Array(guessDigits.length).fill(false);

        // First pass: Check for correct digits in correct positions
        guessDigits.forEach((digit, index) => {
            if (digit === codeDigits[index]) {
                result[index] = {value: digit, status: 'correct'};
                codeMatched[index] = true;
                guessMatched[index] = true;
            }
        });

        // Second pass: Check for correct digits in wrong positions
        guessDigits.forEach((digit, index) => {
            if (!guessMatched[index]) {
                const codeIndex = codeDigits.findIndex(
                    (codeDigit, codeIdx) => codeDigit === digit && !codeMatched[codeIdx]
                );
                if (codeIndex !== -1) {
                    result[index] = {value: digit, status: 'present'};
                    codeMatched[codeIndex] = true;
                    guessMatched[index] = true;
                } else {
                    result[index] = {value: digit, status: 'absent'};
                }
            }
        });

        return result;
    };

    // Function to get the color based on the status
    const getColorClass = (status: 'correct' | 'present' | 'absent') => {
        switch (status) {
            case 'correct':
                return 'bg-green-700 text-green-300';
            case 'present':
                return 'bg-orange-700 text-orange-300';
            case 'absent':
            default:
                return 'bg-gray-700 text-gray-200';
        }
    };

    // Handle auto-submit when playerGuess reaches code length

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
                    <h2 className="text-4xl font-bold text-white text-center">Code Breaker</h2>
                </motion.div>

                {/* Input Field */}
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={
                        shakeInput
                            ? {x: [-10, 10, -10, 10, 0], opacity: 1, y: 0}
                            : {opacity: 1, y: 0}
                    }
                    transition={{duration: 0.5}}
                    className="mb-6"
                >
                    <Input
                        type="text"
                        value={playerGuess}
                        onChange={(e) => {
                            // Allow only digits
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                                setPlayerGuess(value);
                            }
                        }}
                        placeholder={`Enter ${currentQuestion.code.length}-digit code`}
                        className="w-full bg-cyan-500 text-white placeholder-gray-300"
                        disabled={isSubmitting}
                        maxLength={currentQuestion.code.length}
                    />
                </motion.div>

                {/* Attempts List */}
                {attempts.length > 0 && (
                    <motion.div
                        className="mb-6"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5}}
                    >
                        <h3 className="text-2xl flex flex-col justify-center items-center font-semibold text-white mb-4">Your
                            Attempts:</h3>
                        <ul className="space-y-4 flex flex-col items-center justify-center">
                            {attempts.map((guess, index) => {
                                const feedback = evaluateGuess(guess, currentQuestion.code);

                                return (
                                    <li key={index} className="flex items-center space-x-4">
                                        {/* Guess Display */}
                                        <div className="flex space-x-2">
                                            {guess.split('').map((digit, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded-md text-2xl font-bold ${getColorClass(
                                                        feedback[idx].status
                                                    )}`}
                                                >
                          {feedback[idx].status === 'correct' ? digit : digit}
                        </span>
                                            ))}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}

                {/* Secret Code Display */}
                <motion.div
                    className="flex justify-center items-center space-x-2"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.6}}
                >
                    {currentQuestion.code.split('').map((_digit, idx) => (
                        <span
                            key={idx}
                            className={`w-12 h-12 flex items-center justify-center border-2 border-gray-400 rounded-md text-2xl font-bold ${
                                revealedCode[idx]
                                    ? 'bg-green-700 text-green-300'
                                    : 'bg-gray-700 text-white'
                            }`}
                        >
              {revealedCode[idx] ? revealedCode[idx] : '*'}
            </span>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CodeBreakerGame;
