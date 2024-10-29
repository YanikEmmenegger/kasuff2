import {ButtonHTMLAttributes, FC} from "react";
import {twMerge} from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
}

const Button: FC<ButtonProps> = ({children, loading, disabled, className, ...props}) => {
    return (
        <button
            className={twMerge(className, "px-4 py-2 text-white rounded transition")}
            disabled={loading || disabled}
            {...props}>
            {loading ? "Loading..." : children}
        </button>
    );
};

export default Button;
