import React, {FC, useState} from "react";
import {usePlayer} from "../../contexts/playerProvider";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import Input from "../Input";
import Button from "../Button";
import {motion} from "framer-motion";
import {FaSpinner} from "react-icons/fa";

const ChangeNameForm: FC = () => {
    const {player, updatePlayer} = usePlayer();
    const [newName, setNewName] = useState<string>(player?.name || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newName && updatePlayer) {
            setIsUpdating(true);
            try {
                await toast.promise(
                    updatePlayer({name: newName}),
                    {
                        loading: "Saving name...",
                        success: "User name updated successfully!",
                        error: "Failed to update user name.",
                    }
                );
                setIsUpdating(false);
            } catch (error) {
                console.error("Failed to update user name:", error);
                toast("Failed to update user name. Please try again.", {icon: "❌"});
                setIsUpdating(false);
            }
        }
    };

    const handleGoBack = () => {
        navigate("/"); // Navigate back to the main page
    };

    return (
        <div className=" flex items-center justify-center bg-cyan-500 text-gray-200 p-6">
            <motion.div
                className="max-w-md w-full bg-cyan-600 p-8 rounded-lg shadow-lg"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
            >
                <h2 className="text-3xl font-bold mb-6 text-center">Change Your Name</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                    >
                        <Input
                            label="New Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter your new name"
                            className="w-full bg-cyan-500"
                        />
                    </motion.div>

                    <div className="flex flex-col gap-4">
                        <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.4}}
                        >
                            <Button
                                type="submit"
                                className="w-full bg-green-500 hover:bg-green-600 text-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center justify-center"
                                disabled={!newName || newName === player?.name || isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2"/>
                                        Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.6}}
                        >
                            <Button
                                onClick={handleGoBack}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg font-semibold"
                            >
                                Return to Main Page
                            </Button>
                        </motion.div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ChangeNameForm;
