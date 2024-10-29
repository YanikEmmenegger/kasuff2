import { FC } from 'react';

interface TimerSelectorProps {
    timeLimit: number;
    onChange: (timeLimit: number) => void;
}

const TimerSelector: FC<TimerSelectorProps> = ({ timeLimit, onChange }) => {
    const timeOptions = [15, 30, 60, 90]; // Preset times in seconds

    return (
        <div className="p-4 rounded-lg border-2 border-gray-700">
            <p className="text-xl font-semibold text-white mb-2">Time Limit (Seconds)</p>
            <div className="mt-2 space-y-2">
                <select
                    value={timeLimit}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full p-2 bg-gray-800 text-white rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {timeOptions.map((time) => (
                        <option key={time} value={time}>
                            {time} seconds
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TimerSelector;
