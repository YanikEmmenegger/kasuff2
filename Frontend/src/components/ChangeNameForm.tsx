import {useState, FC} from "react";
import {useUser} from "../contexts/userProvider.tsx";
import toast from "react-hot-toast";

const ChangeNameForm: FC = () => {
    const {player, updateUserName} = useUser();
    const [newName, setNewName] = useState<string>(player?.name || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && updateUserName) {
            toast.promise(
                updateUserName(newName),
                {
                    loading: 'Saving name...',
                    success: 'User name updated successfully!',
                    error: 'Failed to update user name.',
                }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex mb-20 flex-col items-center gap-4">
            <label className="text-white text-lg font-medium">
                Change Name
            </label>
            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-2 rounded-md focus:outline-none text-white"
                placeholder={player?.name || ""}
            />
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4"
            >
                Save
            </button>
        </form>
    );
};

export default ChangeNameForm;
