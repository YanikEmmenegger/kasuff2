import {IoCreate} from "react-icons/io5";
import {GiJoin} from "react-icons/gi";

const Navigation = () => {
    const links = [
        {
            name: 'Join Game',
            href: '/game?state=join',
            icon: GiJoin,
        },
        {
            name: 'Create Game',
            href: '/game?state=create',
            icon: IoCreate,
        }
    ];

    return (
        <div className="flex flex-row justify-center items-center space-x-10">
            {links.map((link, index) => (
                <a
                    href={link.href}
                    key={index}
                    className="relative group w-40 h-32 rounded-lg overflow-hidden shadow-lg text-white bg-gray-500 hover:bg-gray-600 transition duration-300 ease-in-out transform hover:scale-105 hover:rotate-2"
                >
                    <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-bl from-gray-700 via-gray-800 to-gray-900 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                    <div className="relative flex flex-col items-center justify-center h-full">
                        <link.icon
                            className="text-white text-4xl mb-2 group-hover:rotate-12 transition-transform duration-500"/>
                        <span className="text-lg font-bold">{link.name}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Navigation;
