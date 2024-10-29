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
                    "px-4 py-2 bg-gray-700 text-white border-2 border-gray-500 rounded focus:outline-none focus:border-blue-500 transition",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default Input;
