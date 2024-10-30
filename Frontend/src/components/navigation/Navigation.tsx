import {IoCreate} from "react-icons/io5";
import {GiJoin} from "react-icons/gi";


const Navigation = () => {
    const links = [
        {
            name: "Join Game",
            href: "/game?state=join",
            icon: GiJoin,
        },
        {
            name: "Create Game",
            href: "/game?state=create",
            icon: IoCreate,
        },
    ];

    return (
        <div
            className="flex flex-col space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            {links.map((link, index) => (
                <a
                    href={link.href}
                    key={index}
                    className="relative group w-40 h-32 rounded-lg overflow-hidden shadow-lg text-white bg-cyan-600 hover:bg-cyan-700 transition duration-300 ease-in-out transform hover:scale-105 hover:rotate-2"
                >
                    <div
                        className="absolute inset-0 w-full h-full bg-gradient-to-bl from-cyan-600 via-cyan-700 to-cyan-800 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                    ></div>
                    <div className="relative flex flex-col items-center justify-center h-full">
                        <link.icon
                            className="text-white text-4xl mb-2 group-hover:rotate-12 transition-transform duration-500"
                        />
                        <span className="text-lg font-bold">{link.name}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Navigation;
