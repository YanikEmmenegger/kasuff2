// src/components/avatar/controls/SliderSelector.tsx

import React from 'react';

interface SliderSelectorProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

const SliderSelector: React.FC<SliderSelectorProps> = ({label, value, options, onChange}) => {
    const currentIndex = options.indexOf(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const index = parseInt(e.target.value, 10);
        onChange(options[index]);
    };

    return (
        <div className="flex flex-col">
            <label className="mb-2 font-semibold">{label}:</label>
            <div className="flex items-center">
                <span>{options[0]}</span>
                <input
                    type="range"
                    min={0}
                    max={options.length - 1}
                    step={1}
                    value={currentIndex}
                    onChange={handleChange}
                    className="mx-4 flex-1"
                />
                <span>{options[options.length - 1]}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
                {options.map((opt, idx) => (
                    <span key={idx}>{opt}</span>
                ))}
            </div>
        </div>
    );
};

export default SliderSelector;
