import {FC, LabelHTMLAttributes} from "react";

interface LabelWithValueProps extends LabelHTMLAttributes<HTMLLabelElement> {
    text: string;
    value: string | number;
}

const LabelWithValue: FC<LabelWithValueProps> = ({text, value, ...props}) => {
    return (
        <div className="flex justify-between items-center mb-2">
            <label className="text-white font-semibold" {...props}>
                {text}
            </label>
            <span className="text-gray-400">{value}</span>
        </div>
    );
};

export default LabelWithValue;
