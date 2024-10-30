import {useEffect, useState} from "react";
import {stupidQuotes} from "../stupidQuotes.ts";

const Quote = () => {

    const interval = 10000; // Change quote every 10 seconds

    const [stupidQuote, setStupidQuote] = useState<string>(stupidQuotes[Math.floor(Math.random() * stupidQuotes.length)])
    const [fade, setFade] = useState(true)
    useEffect(() => {
        setStupidQuote(stupidQuotes[Math.floor(Math.random() * stupidQuotes.length)])

        const timer = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                setStupidQuote(stupidQuotes[Math.floor(Math.random() * stupidQuotes.length)])
                setFade(true); // Start fade in
            }, 500); // Half of the transition time to ensure smooth animation
        }, interval);

        return () => clearInterval(timer); // Cleanup interval timer
    }, [interval, setStupidQuote]);
    return (
        <p className={`text-xs md:text-md text-center transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            "{stupidQuote}" {/* Render the quote */}
        </p>
    );
}

export default Quote;
