// src/components/quiz/SpyGame.tsx

import React, {useEffect, useRef, useState} from 'react';
import {usePlayer} from '../../../../contexts/playerProvider.tsx';
import Button from '../../../Button.tsx'; // Adjust the import path as necessary
import {Player, SpyQuestion} from '../../../../types';
import {motion} from 'framer-motion';
import toast from 'react-hot-toast';
import SpyCard from "./SpyCard.tsx";
import {twMerge} from "tailwind-merge";

const SpyComponent: React.FC = () => {
    const {game, player, sendAnswer} = usePlayer();

    // State to hold the current question
    const [currentQuestion, setCurrentQuestion] = useState<SpyQuestion | null>(null);
    // State to determine if the current player is the SPY
    const [isSpy, setIsSpy] = useState<boolean>(false);
    // State to manage card visibility
    const [cardRevealed, setCardRevealed] = useState<boolean>(false);
    const [votingEnabled, setVotingEnabled] = useState<boolean>(false);

    // Ref to hold the timeout for hiding the card
    const timerRef = useRef<number>(0);

    // Effect to set the current question and determine if the player is the SPY
    useEffect(() => {
        if (!game) return;

        const question = game.rounds[game.currentRoundIndex]?.data as SpyQuestion;
        setCurrentQuestion(question);
        setIsSpy(question.spy === player?._id);
    }, [game, player]);

    // Effect to handle the 5-second timer for hiding the card
    useEffect(() => {
        if (cardRevealed) {
            // Start timer to hide the card after 5 seconds
            timerRef.current = setTimeout(() => {
                setCardRevealed(false);
            }, 5000);
        }

        // Cleanup the timer when the component unmounts or cardRevealed changes
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [cardRevealed]);

    // Handler for card clicks
    const handleCardClick = () => {
        if (cardRevealed) {
            // If the card is already revealed, hide it and clear the timer
            setCardRevealed(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            // Reveal the card
            setCardRevealed(true);
        }
    };


    // Handler for player vote button clicks
    const handlePlayerVote = async (playerId: string) => {
        if (!votingEnabled) return;

        // Simulate sending the answer (to be implemented later)
        try {
            await toast.promise(sendAnswer(playerId), {
                loading: 'Submitting your guesses...',
                success: 'your guess has been submitted!',
                error: 'Error submitting your guess.',
            });
            // Optionally, navigate to a results page or reset the game
        } catch (error) {
            console.error('Error submitting guesses:', error);
        }

    };

    // Render error messages if game or question data is unavailable
    if (!currentQuestion) {
        return <div className="text-center text-red-500">No current question available.</div>;
    }

    if (!game) {
        return <div className="text-center text-red-500">No game data available.</div>;
    }

    return (
        <div className="mt-5 h-auto w-full flex flex-col items-center p-6 bg-cyan-500 text-gray-200">
            {/* Heading */}
            <motion.h2
                className="md:text-4xl text-2xl font-bold mb-6"
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
                Who's the Spy? 🕵️‍♂️
            </motion.h2>
            <motion.h2
                className="md:text-xl text-lg font-bold mb-6"
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
                {currentQuestion.topic}
            </motion.h2>


            <SpyCard hints={currentQuestion.secret.hints || []} onClick={handleCardClick} cardRevealed={cardRevealed}
                     isSpy={isSpy}
                     secret={currentQuestion.secret.option}/>

            {/* Players List */}

            <div className={"w-3/4 md:w-1/2 gap-3 flex flex-col items-center justify-center mt-2"}>
                <h2 className={"text-xs text-center italic"}>
                    "Every player (including spy) will now say a word related to the secret word. Then everyone will
                    vote on
                    who they think the spy is. (try not to use to obvious words)"</h2>
                <p className={"text-center mx-auto text-sm"}>{currentQuestion.starter} will start!</p>
            </div>

            <div
                className={twMerge("players-list flex flex-col justify-center gap-1 mt-5 mb-6")}>
                <Button onClick={() => setVotingEnabled(!votingEnabled)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded transition-colors duration-300">
                    Click to {votingEnabled ? "disable" : "enable"} Voting 🕵️‍♂️
                </Button>
                <p className={"text-xs text-center mb-5"}>Spy, just vote for anyone 😎</p>
                <div className={"flex flex-col gap-4"}>
                    {game.players.map((player: Player) => (
                        <Button
                            key={player._id}
                            onClick={() => handlePlayerVote(player._id)}
                            disabled={!votingEnabled}
                            className={twMerge("text-white disabled:cursor-not-allowed px-4 py-2 rounded transition-colors duration-300",
                                votingEnabled ? "bg-purple-500 hover:bg-purple-600" : "bg-gray-500 line-through")}
                        >
                            {player.name}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpyComponent;
