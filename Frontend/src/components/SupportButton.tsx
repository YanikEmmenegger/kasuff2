import Button from "./Button.tsx";
import {AiFillHeart} from "react-icons/ai";
import {FC} from "react";

interface SupportButtonProps {
    children?: React.ReactNode;
}

const SupportButton: FC<SupportButtonProps> = ({children}) => {
    return (
        <a target={"_blank"} href={"https://buymeacoffee.com/yanikemmenegger"}>
            <Button className={"flex items-center w-full justify-center gap-1 bg-green-500 hover:bg-green-600"}>
                {children ? children : <>Donate <AiFillHeart/></>}
            </Button>
        </a>);
}

export default SupportButton;
