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

const minPort = 10_000;
const maxPort = 60_000;

const deltaPort = maxPort - minPort;

export type BaseContainer = {
    host: string;
    port: number;
    str: string;
};

const seenIds = new Set<string>();
const seenPorts = new Set<number>();
export const hashTestingDataInto = (
    context: Mocha.Context,
    container: BaseContainer,
): void => {
    const id = context.currentTest?.fullTitle();
    if (!id) {
        throw new Error(`Cannot get full title for ${String(context)}`);
    }

    if (seenIds.has(id)) {
        throw new Error(`Duplicate test id detected: '${id}'`);
    } else {
        seenIds.add(id);
    }

    const port = minPort + (Math.abs(hashString(id)) % deltaPort);
    if (seenPorts.has(port)) {
        throw new Error(`Duplicate port detected in test '${id}': ${port}`);
    } else {
        seenPorts.add(port);
    }

    container.host = "localhost";
    container.port = port;
    container.str = id;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const newContainer = <T extends {}>(
    container: T,
): T & BaseContainer => ({
    ...container,
    host: "",
    port: 0,
    str: "",
});
