// src/utils/colorUtils.ts

import {
    AvatarOptions,
    BEARD_TYPE_OPTIONS,
    EYE_TYPE_OPTIONS,
    EYEBROW_TYPE_OPTIONS,
    FACE_SHAPE_OPTIONS,
    HAIR_TYPE_OPTIONS,
    MOUTH_TYPE_OPTIONS,
    NOSE_TYPE_OPTIONS
} from "./types/avatarType.ts";

/**
 * Converts a HEX color to HSL.
 * @param hex - The HEX color string (e.g., "#ff5733").
 * @returns An object containing the HSL representation.
 */
export const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } else {
        throw new Error("Invalid HEX color format.");
    }
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // eslint-disable-next-line prefer-const
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {h: h * 360, s: s * 100, l: l * 100};
};

/**
 * Converts an HSL color to HEX.
 * @param h - Hue component (0 - 360).
 * @param s - Saturation component (0 - 100).
 * @param l - Lightness component (0 - 100).
 * @returns The HEX color string.
 */
export const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r = 0, g = 0, b = 0;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// src/utils/calculateColor.ts


/**
 * Calculates a new array of colors based on the chosen color and desired tones.
 * @param colorsToMatch - An array of HEX color strings representing desired tones. The first color is replaced by chosenColor.
 * @param chosenColor - The HEX color string chosen by the player.
 * @returns A new array of HEX color strings with the first color as chosenColor and subsequent colors adjusted to match desired tones.
 */
export const calculateColor = (colorsToMatch: string[], chosenColor: string): string[] => {
    if (!chosenColor) throw new Error("chosenColor is required.");
    if (!colorsToMatch || colorsToMatch.length === 0) return [];

    // Initialize newColors with chosenColor as the first element
    const newColors: string[] = [chosenColor];

    // Convert chosenColor to HSL
    const chosenHSL = hexToHSL(chosenColor);

    // Iterate over colorsToMatch starting from index 1
    for (let i = 1; i < colorsToMatch.length; i++) {
        const targetColor = colorsToMatch[i];
        const targetHSL = hexToHSL(targetColor);

        // Create a new color with chosen hue and target saturation & lightness
        const adjustedColor = hslToHex(chosenHSL.h, targetHSL.s, targetHSL.l);

        newColors.push(adjustedColor);
    }

    return newColors;
};


/**
 * Helper function to select a random element from an array.
 * @param array - The array to select from.
 * @returns A randomly selected element from the array.
 */
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper function to generate a random hexadecimal color code.
 * @returns A random color in hexadecimal format.
 */
function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Generates a random AvatarOptions object with random selections and colors.
 * @returns A randomized AvatarOptions object.
 */
export function getRandomAvatarOptions(): AvatarOptions {
    return {
        faceColor: getRandomColor(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        faceShape: getRandomElement(FACE_SHAPE_OPTIONS),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        eyeType: getRandomElement(EYE_TYPE_OPTIONS),
        eyeColor: getRandomColor(),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        hairType: getRandomElement(HAIR_TYPE_OPTIONS),
        hairColor: getRandomColor(),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        beardType: getRandomElement(BEARD_TYPE_OPTIONS),
        beardColor: getRandomColor(),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        mouthType: getRandomElement(MOUTH_TYPE_OPTIONS),
        mouthColor: getRandomColor(),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        noseType: getRandomElement(NOSE_TYPE_OPTIONS),
        noseColor: getRandomColor(),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        eyebrowType: getRandomElement(EYEBROW_TYPE_OPTIONS),
        eyebrowColor: getRandomColor(),
    };
}
