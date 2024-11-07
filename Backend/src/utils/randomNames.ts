// Define arrays of adjectives and nouns
const adjectives = [
    "Silly", "Funky", "Wacky", "Goofy", "Crazy", "Zany", "Cheeky", "Lazy", "Grumpy", "Jolly",
    "Fat", "Dumb", "Flipping", "Sloppy", "Drunky", "Slurring", "Tipsy", "Wasted", "Sleepy",
    "Clumsy", "Stupid", "Brainless", "Dopey", "Useless", "Clueless", "Drooling", "Sweaty",
    "Ludicrous", "Imbecilic", "Moronic", "Buffoonish", "Dim-witted", "Absurd", "Ignorant",
    "Delirious", "Scatterbrained", "Deranged", "Obtuse", "Gibbering", "Pathetic",
    "Miserable", "Foul-mouthed", "Ass-faced", "Piss-drunk", "Booze-soaked", "Shit-talking",
    "Knob-headed", "Cocky", "Dick-brained", "Bastardized", "Throbbing", "Lusty", "Horny",
    "Filthy", "Perverted", "Randy", "Greasy", "Moaning", "Humping", "Thrusting",
    "Groping", "Slutty", "Naughty", "Sleazy", "Cunty", "Bitchy"
];

const nouns = [
    "FuckFace","Banana", "Monkey", "Unicorn", "Nonce", "Wanker", "Ass", "Wanker", "Cunt", "Bastard", "Douche", "Dickhead", "Knobhead", "Shithead",
    "Pisshead", "Twit", "Prick", "Tosser", "Wanker", "Arsehole", "Scumbag", "Cockwomble", "Bellend",
    "Fucker", "Dipshit", "Jackass", "Fuckwit", "KnobJockey", "Asswipe", "Twat", "Pisspot", "Dumbass",
    "Loser", "Idiot", "Douchebag", "FartSniffer", "Butthead", "Shitbag", "Cocksucker", "Slut",
    "Meathead", "Slag", "Slopbucket", "DickLicker", "CockLover", "AssLover", "TittyGrabber",
    "CockThrobber", "PussyMuncher", "AssEater", "FannyTickler", "NippleTwister", "BallJuggler",
    "PantySniffer", "TittySqueezer", "HardOn", "SmallDick", "WetDream", "Perv", "WankStain", "Splooge", "Whore", "Bitch", "Cunt", "Twat"
];

// Helper function to get a random element from an array
function getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
}

export const generateRandomUsername = (): string => {
    const adjective = getRandomElement(adjectives);
    const noun = getRandomElement(nouns);
    return `${adjective}${noun}`;
}
