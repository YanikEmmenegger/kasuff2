import React, {FC, useState} from "react";
import Button from "./Button.tsx";
import {AiFillHeart, AiOutlineCoffee} from "react-icons/ai";
import {FaEllipsisH, FaPaypal} from "react-icons/fa"; // Importing additional icons

interface SupportButtonProps {
    children?: React.ReactNode;
}

const SupportButton: FC<SupportButtonProps> = ({children}) => {
    const [showOptions, setShowOptions] = useState(false);
    // const [isProcessing, setIsProcessing] = useState(false); // Optional: For handling any async actions

    // Handler for the initial button click to show options
    const handleFirstClick = () => {
        setShowOptions(true);
    };

    // Handler to cancel and hide options
    const handleCancel = () => {
        setShowOptions(false);
    };

    // Handlers for each support option (optional: add any async actions if needed)
    const handleBuyMeACoffee = () => {
        handleCancel();
        // Additional logic can be added here if needed
    };

    const handlePayPal = () => {
        handleCancel();
        // Add logic if needed
    };

    const handleOther = () => {
        handleCancel();
        // You might want to open a modal or redirect to a contact form
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            {showOptions ? (
                <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                    {/* Buy me a coffee Option */}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://buymeacoffee.com/yanikemmenegger"
                        onClick={handleBuyMeACoffee}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600">
                            <AiOutlineCoffee/>
                            Buy me a coffee
                        </Button>
                    </a>

                    {/* PayPal Option */}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://paypal.me/yyanik?country.x=CH&locale.x=de_DE"
                        onClick={handlePayPal}
                        className="w-full sm:w-auto"
                    >
                        <Button
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600">
                            <FaPaypal/>
                            PayPal
                        </Button>
                    </a>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://instagram.com/yanik.ee"
                        onClick={handleOther}
                        className="w-full sm:w-auto"
                    >
                        {/* Other Option */}
                        <Button
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600"
                            onClick={handleOther}
                        >
                            <FaEllipsisH/>
                            Other
                        </Button>
                    </a>

                    {/* Cancel Button */}

                </div>
            ) : (
                // Initial Donate Button
                <Button
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
                    onClick={handleFirstClick}
                >
                    {children ? (
                        children
                    ) : (
                        <>
                            Support me <AiFillHeart/>
                        </>
                    )}
                </Button>
            )}
        </div>
    );
};

export default SupportButton;
