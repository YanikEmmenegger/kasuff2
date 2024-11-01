import {FC} from "react";
import {Toaster} from "react-hot-toast";

interface ToasterProviderProps {
    children: React.ReactNode;
}

const ToasterProvider: FC<ToasterProviderProps> = ({children}) => {
    return (
        <>
            <Toaster position="top-center"
            />
            {children}
        </>
    );
}

export default ToasterProvider;
