import React, {FC, useEffect, useRef, useState} from "react";
import {motion} from "framer-motion";

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    thumbIcon?: React.ReactNode; // Icon above the slider thumb
}

const Slider: FC<SliderProps> = ({
                                     min,
                                     max,
                                     step,
                                     value,
                                     onChange,
                                     startIcon,
                                     endIcon,
                                     thumbIcon,
                                 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const sliderRef = useRef<HTMLInputElement>(null);
    const [thumbPosition, setThumbPosition] = useState(0);

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    useEffect(() => {
        if (sliderRef.current) {
            const slider = sliderRef.current;
            const sliderWidth = slider.offsetWidth;
            const thumbWidth = 16; // Same as in CSS
            const percent = (value - min) / (max - min);
            const thumbOffset = percent * sliderWidth - thumbWidth / 2;
            setThumbPosition(thumbOffset);
        }
    }, [value, min, max]);

    return (
        <div className="p-4 py-10 w-full rounded-lg relative">
            <div className="flex items-center space-x-4">
                {/* Start icon and min value */}
                <div className="flex items-center space-x-1">
                    {startIcon && <span>{startIcon}</span>}
                    <span className="text-white w-8 text-center">{min}</span>
                </div>

                {/* Slider */}
                <div className="relative w-full">
                    {thumbIcon && (
                        <motion.div
                            className="absolute transform -translate-x-1/2"
                            style={{left: thumbPosition, top: -30}}
                            initial={{opacity: 0, y: -5}}
                            animate={
                                isDragging || isFocused || isHovered
                                    ? {opacity: 1, y: 0}
                                    : {opacity: 0, y: -5}
                            }
                            transition={{type: "spring", stiffness: 300, damping: 20}}
                        >
                            {thumbIcon}
                        </motion.div>
                    )}
                    <input
                        ref={sliderRef}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                        onMouseUp={handleDragEnd}
                        onTouchEnd={handleDragEnd}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="w-full h-1 bg-cyan-500 rounded-lg appearance-none cursor-pointer outline-none text-cyan-500"
                    />
                    {/* Custom thumb styling */}
                    <style>{`
                        input[type="range"] {
                            -webkit-appearance: none;
                            appearance: none;
                            background: transparent;
                        }

                        input[type="range"]:focus {
                            outline: none;
                        }

                        input[type="range"]::-webkit-slider-runnable-track {
                            width: 100%;
                            height: 4px;
                            cursor: pointer;
                            background: currentColor;
                            border-radius: 2px;
                        }

                        input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            margin-top: -6px;
                            width: 16px;
                            height: 16px;
                            background: currentColor;
                            border-radius: 50%;
                            cursor: pointer;
                        }

                        input[type="range"]::-moz-range-track {
                            width: 100%;
                            height: 4px;
                            cursor: pointer;
                            background: currentColor;
                            border-radius: 2px;
                        }

                        input[type="range"]::-moz-range-thumb {
                            width: 16px;
                            height: 16px;
                            background: currentColor;
                            border-radius: 50%;
                            cursor: pointer;
                        }

                        input[type="range"]::-ms-track {
                            width: 100%;
                            height: 4px;
                            cursor: pointer;
                            background: transparent;
                            border-color: transparent;
                            color: transparent;
                        }

                        input[type="range"]::-ms-fill-lower {
                            background: currentColor;
                            border-radius: 2px;
                        }

                        input[type="range"]::-ms-fill-upper {
                            background: currentColor;
                            border-radius: 2px;
                        }

                        input[type="range"]::-ms-thumb {
                            width: 16px;
                            height: 16px;
                            background: currentColor;
                            border-radius: 50%;
                            cursor: pointer;
                        }
                    `}</style>
                </div>

                {/* End icon and max value */}
                <div className="flex items-center space-x-1">
                    <span className="text-white w-8 text-center">{max}</span>
                    {endIcon && <span>{endIcon}</span>}
                </div>
            </div>
        </div>
    );
};

export default Slider;
