export const getScrabbledWord = (language?: string) => {
    let word;


    switch (language) {
        case 'de':
            word = words_de[Math.floor(Math.random() * words_de.length)];
            break;
        default:
            word = words_de[Math.floor(Math.random() * words_de.length)];
            break;
    }

    const scrabbledWord = word.split('').sort(() => Math.random() - 0.5).join('').toLowerCase();

    word = word.toLowerCase();

    return {word, scrabbledWord};

}


export const words_de = [
    "Hundert",
    "Kasten",
    "Kuchen",
    "Blume",
    "Schule",
    "Garten",
    "Wasser",
    "Baum",
    "Teller",
    "Lampe",
    "Fahnen",
    "Apfel",
    "Fenster",
    "Möbel",
    "Mütze",
    "Regen",
    "Gabel",
    "Tasse",
    "Blatt",
    "Fahrrad",
    "Schloss",
    "Drache",
    "Kabel",
    "Stein",
    "Krone",
    "Kissen",
    "Leiter",
    "Schnecke",
    "Tasche",
    "Zahnarzt",
    "Spieler",
    "Blitz",
    "Wolke",
    "Wiese",
    "Koch",
    "Himmel",
    "Fisch",
    "Schnee",
    "König",
    "Brücke",
    "Kerze",
    "Erdbeere",
    "Lampe",
    "Traube",
    "Stern",
    "Feld",
    "Wasserfall",
    "Boden",
    "Musik",
    "Schüler",
    "Hocker",
    "Banane",
    "Kranke",
    "Heizung",
    "Löffel",
    "Tropfen",
    "Flasche",
    "Flugzeug",
    "Koch",
    "Biene",
    "Strand",
    "Rätsel",
    "Mond",
    "Bild",
    "Fluss",
    "Gerät",
    "Glocke",
    "Schrank",
    "Händler",
    "Palme",
    "Erdbeere",
    "Fenster",
    "Wäsche",
    "Brille",
    "Lächeln",
    "Zimmer",
    "Held",
    "Schloss",
    "Lager",
    "Kirsche",
    "Pfanne",
    "Ernte",
    "Traum",
    "Herz",
    "Räuber",
    "Frieden",
    "Hände",
    "Wunder",
    "Kreise",
    "Boden",
    "Wasser",
    "Lehrer",
    "Zauber",
    "Äpfel",
    "Ärztin"
];
