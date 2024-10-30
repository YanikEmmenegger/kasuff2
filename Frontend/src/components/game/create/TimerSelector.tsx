import  {FC} from 'react';
import {motion} from 'framer-motion';
import {FaClock} from 'react-icons/fa'; // Example icon, replace as needed

interface TimerSelectorProps {
    timeLimit: number;
    onChange: (timeLimit: number) => void;
}

const timeOptions = [
    {value: 15, label: '15 seconds', icon: <FaClock/>},
    {value: 30, label: '30 seconds', icon: <FaClock/>},
    {value: 60, label: '1 minute', icon: <FaClock/>},
    {value: 90, label: '1.5 minutes', icon: <FaClock/>},
];

const TimerSelector: FC<TimerSelectorProps> = ({ timeLimit, onChange }) => {
    return (
        <div className="p-4 w-full rounded-lg border-2 border-cyan-600">
            <div className="mt-2 space-y-2">
                <div className="flex flex-wrap justify-center gap-2">
                    {timeOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            onClick={() => onChange(option.value)}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            className={`flex w-full items-center px-4 py-2 rounded-lg cursor-pointer focus:outline-none transition-colors
                ${
                                timeLimit === option.value
                                    ? 'bg-cyan-800 text-white'
                                    : 'bg-cyan-600 text-gray-800'
                            }`}
                        >
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimerSelector;
