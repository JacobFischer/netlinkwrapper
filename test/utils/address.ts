/**
 * Converts a string to a semi-unique hash number.
 *
 * @param str - String to hash.
 * @returns A semi-unqiue number.
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export const testingAddress = (str: string) =>
    ["localhost", 10_000 + (Math.abs(hashString(str)) % 50_000)] as const;
