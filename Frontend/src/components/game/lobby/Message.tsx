import {FC} from "react";

interface MessageProps {
    playerName: string;
    message: string;
}

const Message: FC<MessageProps> = ({playerName, message}) => {
    return (
        <div>
            <span className="font-bold">{playerName}</span>: {message}

        </div>
    );
}

export default Message;
