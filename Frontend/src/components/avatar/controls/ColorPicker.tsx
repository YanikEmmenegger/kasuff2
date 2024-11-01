// src/components/avatar/controls/ColorPicker.tsx

import React from 'react';
import Input from "../../Input.tsx";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({value, onChange}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <Input
            type="color"
            value={value}
            onChange={handleChange}
            className="w-16 h-8 p-0 border-none"
        />
    );
};

export default ColorPicker;
