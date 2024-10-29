import React, {useState} from 'react';
import toast from 'react-hot-toast';
import {usePlayer} from "../../contexts/playerProvider.tsx";
import Button from "../Button.tsx";

const LeaveButton: React.FC = () => {
    const {player, socket, leaveGame} = usePlayer(); // Access player, socket, and leaveGame function from context
    const [confirmLeave, setConfirmLeave] = useState(false); // Track whether user clicked the first time to confirm
    const [isLeaving, setIsLeaving] = useState(false); // Track loading state while leaving the game

    const handleLeaveGame = async () => {
        if (!player || !socket) return;

        setIsLeaving(true); // Set loading state
        const result = await leaveGame(); // Call the leaveGame function
        if (result) {
            toast.success('You have successfully left the game!');
            // reaload the page and redirect to the home page
            window.location.href = '/';
        } else {
            toast.error('Failed to leave the game. Please try again.');
        }

        setIsLeaving(false); // Reset loading state
        setConfirmLeave(false); // Reset confirm leave state
    };

    const handleFirstClick = () => {
        setConfirmLeave(true); // Show cancel and confirm buttons
    };

    const handleCancel = () => {
        setConfirmLeave(false); // Revert back to "Leave Game" button
    };

    return (
        <div className="flex flex-col">
            {confirmLeave ? (
                <div className="flex space-x-4">
                    <Button
                        className="bg-gray-500 hover:bg-gray-600"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={`bg-red-500 ${isLeaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        onClick={handleLeaveGame}
                        disabled={isLeaving} // Disable button while leaving the game
                    >
                        {isLeaving ? 'Leaving...' : 'Confirm'}
                    </Button>
                </div>
            ) : (
                <div className="flex space-x-4">
                    <Button
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleFirstClick}
                    >
                        Leave Game
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LeaveButton;
