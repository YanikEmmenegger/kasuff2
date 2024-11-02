// src/components/avatar/controls/CarouselSelector.tsx

import React, {useEffect, useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-flip';
import './css/swiper.css'


// Initialize Swiper module
interface CarouselSelectorProps {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

const CarouselSelector: React.FC<CarouselSelectorProps> = ({label, value, options, onChange}) => {

    const [activeIndex, setActiveIndex] = useState(options.indexOf(value));

    // Ref to access the Swiper instance
    const swiperRef = useRef<SwiperCore>();

    /**
     * Handles slide change event.
     * @param swiper - The Swiper instance.
     */
    const handleSlideChange = (swiper: SwiperCore) => {
        const newValue = options[swiper.activeIndex];
        if (newValue !== value) {
            setActiveIndex(swiper.activeIndex);
            onChange(newValue);
        }
    };

    /**
     * Handles direct click on a slide.
     * @param option - The selected option.
     */
    const handleOptionClick = (option: string) => {
        if (option !== value) {
            const newIndex = options.indexOf(option);
            if (newIndex !== -1 && swiperRef.current) {
                swiperRef.current.slideTo(newIndex, 500); // 500ms transition
                // onChange will be called in handleSlideChange
            }
        }
    };

    /**
     * Synchronizes Swiper when activeIndex changes externally.
     */
    useEffect(() => {
        if (swiperRef.current) {
            swiperRef.current.slideTo(activeIndex, 500);
        }
    }, [activeIndex]);

    function formatOption(option: string) {
        return option
            .split('-') // Split the option by hyphens
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize each part
            .join(' '); // Join the parts with spaces
    }

    return (
        <div className="flex flex-col w-full relative">

            {/* Swiper Carousel */}
            <Swiper
                id={`carousel-${label}`}
                spaceBetween={25}
                slidesPerView={3}
                centeredSlides={true}
                allowTouchMove={true}
                initialSlide={activeIndex}
                onSlideChange={handleSlideChange}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                }}
                pagination={{clickable: true, type: "bullets"}}
                className="w-full p-5 rounded-lg"
            >
                {options.map((option, index) => (
                    <SwiperSlide key={index}>
                        <button
                            type="button"
                            className={`w-full h-auto py-5 mb-5 flex items-center justify-center text-center text-sm md:text-base rounded-lg transition-transform duration-300
                                ${
                                option === value
                                    ? 'bg-cyan-400 text-white scale-110 shadow-lg'
                                    : 'bg-cyan-100 text-gray-800 hover:bg-cyan-400 hover:text-white'
                            }`}
                            onClick={() => handleOptionClick(option)}
                            aria-pressed={option === value}
                        >
                            {formatOption(option)}
                        </button>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Buttons (Optional) */}
            {/*
            If you have custom navigation buttons and want to include them without altering the design,
            ensure they are correctly linked to the Swiper instance.

            <button
                className={`swiper-button-prev-${label} absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 focus:outline-none z-10`}
                aria-label={`Previous ${label}`}
            >
                <FaChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
            <button
                className={`swiper-button-next-${label} absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-200 focus:outline-none z-10`}
                aria-label={`Next ${label}`}
            >
                <FaChevronRight className="h-5 w-5 text-gray-800" />
            </button>
            */}

        </div>
    );
};

export default CarouselSelector;
