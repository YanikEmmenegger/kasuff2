import {FC, InputHTMLAttributes} from "react";
import {twMerge} from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
}

const Input: FC<InputProps> = ({label, className, ...props}) => {
    return (
        <div className="flex flex-col space-y-2">
            {label && <label className="text-white font-semibold">{label}</label>}
            <input
                className={twMerge(
                    "px-4 py-2 text-white bg-cyan-600 border-2 border-cyan-600 rounded focus:outline-none outline-0 transition",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default Input;
