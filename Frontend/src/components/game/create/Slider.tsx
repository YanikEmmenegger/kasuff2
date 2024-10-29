import {FC} from "react";

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const Slider: FC<SliderProps> = ({min, max, step, value, onChange, startIcon, endIcon}) => {
    return (
        <div className="p-4 rounded-lg border-2 border-gray-700">
            <div className="text-xl font-semibold text-white mb-2 text-center"></div>
            <div className="flex items-center space-x-4">
                {/* Start icon and min value */}
                <div className="flex items-center space-x-1">
                    {startIcon && <span>{startIcon}</span>}
                    <span className="text-white">{min}</span>
                </div>

                {/* Slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* End icon and max value */}
                <div className="flex items-center space-x-1">
                    <span className="text-white">{max}</span>
                    {endIcon && <span>{endIcon}</span>}
                </div>
            </div>
        </div>
    );
};

export default Slider;
