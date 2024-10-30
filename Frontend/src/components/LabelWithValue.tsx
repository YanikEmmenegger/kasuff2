import {FC, LabelHTMLAttributes} from "react";

interface LabelWithValueProps extends LabelHTMLAttributes<HTMLLabelElement> {
    text: string;
    value?: string | number;
}

const LabelWithValue: FC<LabelWithValueProps> = ({text, value, ...props}) => {
    return (
        <div className="flex justify-between  w-full p-3 mx-2 items-center mb-2">
            <label className="text-white font-semibold text-lg" {...props}>
                {text}
            </label>
            <span className="text-white text-lg font-semibold">{value}</span>
        </div>
    );
};

export default LabelWithValue;
