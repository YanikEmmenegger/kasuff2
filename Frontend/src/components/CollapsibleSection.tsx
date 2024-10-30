import React, {FC, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
}

const CollapsibleSection: FC<CollapsibleSectionProps> = ({title, children}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-cyan-600 rounded-md shadow-md mb-4 w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-gray-200 focus:outline-none"
            >
                <h3 className="text-xl font-semibold">{title}</h3>
                {isOpen ? <FaChevronUp/> : <FaChevronDown/>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial={{height: 0, opacity: 0}}
                        animate={{height: "auto", opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        className="px-4 pb-4 overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleSection;
