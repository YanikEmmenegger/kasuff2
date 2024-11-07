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
    "Blumen",
    "Schule",
    "Garten",
    "Wasser",
    "Bäume",
    "Teller",
    "Lampe",
    "Fahnen",
    "Apfelsaft",
    "Fenster",
    "Möbel",
    "Mütze",
    "Regen",
    "Gabeln",
    "Tassen",
    "Blätter",
    "Fahrrad",
    "Schloss",
    "Drachen",
    "Kabel",
    "Steine",
    "Krone",
    "Teilen",
    "Kissen",
    "Leiter",
    "Schnecke",
    "Taschen",
    "Zahnarzt",
    "Spieler",
    "Blitzen",
    "Wolken",
    "Wiesen",
    "Kochen",
    "Himmel",
    "Fische",
    "Schnee",
    "Bücher",
    "Brücke",
    "Kerzen",
    "Erdbeere",
    "Lampen",
    "Trauben",
    "Sterne",
    "Felder",
    "Wasserfall",
    "Boden",
    "Musiker",
    "Schüler",
    "Hocker",
    "Banane",
    "Kranken",
    "Gefrier",
    "Heizung",
    "Löffeln",
    "Tropfen",
    "Flasche",
    "Fliegen",
    "Drachen",
    "Kochen",
    "Bienen",
    "Strände",
    "Rätsel",
    "Monde",
    "Bilder",
    "Flüsse",
    "Wärme",
    "Geräte",
    "Glocke",
    "Blätter",
    "Schrank",
    "Händler",
    "Palmen",
    "Erdbeer",
    "Fenster",
    "Wäsche",
    "Brillen",
    "Lächeln",
    "Zimmer",
    "Helden",
    "Schloss",
    "Lager",
    "Kirsche",
    "Gefäng",
    "Pfanne",
    "Ernten",
    "Traum",
    "Herzen",
    "Räuber",
    "Frieden",
    "Hände",
    "Wunder",
    "Kreise",
    "Boden",
    "Wasser",
    "Lehrer",
    "Blumen",
    "Zauber",
    "Äpfeln",
    "Ärztin"
];
