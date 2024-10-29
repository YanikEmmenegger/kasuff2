import {FC, useState} from "react";
import {usePlayer} from "../../contexts/playerProvider.tsx";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom"; // Import useNavigate for navigation
import Input from "../Input.tsx"; // Import the reusable Input component
import Button from "../Button.tsx"; // Import the reusable Button component

const ChangeNameForm: FC = () => {
    const {player, updatePlayer} = usePlayer();
    const [newName, setNewName] = useState<string>(player?.name || "");
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && updatePlayer) {
            toast.promise(
                updatePlayer({name: newName}), // Correct key is "name" instead of "newName"
                {
                    loading: 'Saving name...',
                    success: 'User name updated successfully!',
                    error: 'Failed to update user name.',
                }
            );
        }
    };

    const handleGoBack = () => {
        navigate("/"); // Navigate back to the main page
    };

    return (
        <div className="max-w-lg mx-auto p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Change Your Name</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                    label="New Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your new name"
                    className="w-full"
                />

                <div className="flex flex-col gap-4">
                    <Button type="submit" className="w-full bg-green-500 hover:bg-green-700"
                            disabled={!newName || newName === player?.name}>
                        Save
                    </Button>


                </div>
                <Button onClick={handleGoBack} className="w-full bg-gray-600 hover:bg-gray-700">
                    Return to Main Page
                </Button>
            </form>
        </div>
    );
};

export default ChangeNameForm;
