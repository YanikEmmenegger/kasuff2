import {FC, useState} from "react";
import {stupidQuotes} from "./stupidQuotes.ts";

const WaitingRoom: FC = () => {

    const [stupidQuote] = useState(stupidQuotes[Math.floor(Math.random() * stupidQuotes.length)])

    return (
        <div className="flex flex-col items-center justify-center text-white space-y-6">
            <div className="flex flex-col justify-center items-center space-y-4">
                <p className="text-2xl text-gray-400">Hang on!!!</p>
            </div>

            {/* Animated Dots */}
            <div className="flex space-x-2 mt-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                    className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                    style={{animationDelay: "0.2s"}}
                ></div>
                <div
                    className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                    style={{animationDelay: "0.4s"}}
                ></div>
            </div>
            <div className={"p-4 flex items-center justify-center w-full fixed bottom-20 left-0"}>
                <p className={"text-center"}>
                    "
                    {stupidQuote}
                    "
                </p>
            </div>
        </div>
    );
};

export default WaitingRoom;
