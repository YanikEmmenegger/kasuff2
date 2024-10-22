import {FC} from "react";
import {IoCreate} from "react-icons/io5";
import {GiJoin} from "react-icons/gi";

interface NavigationProps {
}

const Navigation: FC<NavigationProps> = ({}) => {
    const links = [
        {
            name: 'Join Game',
            href: '/player',
            icon: GiJoin, // Fixed: Join Game should use GiJoin icon
        },
        {
            name: 'Create Game',
            href: '/game',
            icon: IoCreate // Fixed: Create Game should use IoCreate icon
        }
    ];

    return (
        <div className="flex flex-row justify-center items-center space-x-10">
            {links.map((link, index) => (
                <a
                    href={link.href}
                    key={index}
                    className="relative group w-40 h-32 rounded-lg overflow-hidden shadow-lg text-white bg-gray-800 hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    <div
                        className="absolute inset-0 w-full h-full bg-gra bg-gradient-to-bl from-teal-500 via-fuchsia-400 to-purple-600 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center justify-center h-full">
                        <link.icon className="text-white text-4xl mb-2"/>
                        <span className="text-lg font-bold">{link.name}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Navigation;
