import { EchoSocket } from "./echo-socket";
import { NetLinkSocketBase } from "../../lib";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Converts a string to a semi-unique hash number.
 *
 * @param str - String to hash.
 * @returns A semi-unique number.
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

export abstract class Tester<
    TNetLink extends NetLinkSocketBase,
    TEcho extends EchoSocket
> {
    public host: string;
    public port: number;
    public str: string;

    public netLink!: TNetLink;
    public echo: TEcho;
    public settableNetLink!: Writeable<TNetLink>;

    public static readonly tests: string = "";

    constructor(
        suite: Mocha.Suite,
        echo: TEcho,
        newNetLink: (arg: { host: string; port: number }) => TNetLink,
        echoFirst = true,
        alsoBeforeEach?: (tester: Tester<TNetLink, TEcho>) => Promise<void>,
    ) {
        this.host = "";
        this.port = 0;
        this.str = "";
        this.echo = echo;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self: Tester<TNetLink, TEcho> = this;
        suite.beforeEach(async function () {
            self.hash(this);

            if (echoFirst) {
                await self.echo.start(self);
            }
            self.netLink = newNetLink(self);
            self.settableNetLink = self.netLink;
            if (!echoFirst) {
                await self.echo.start(self);
            }

            if (alsoBeforeEach) {
                await alsoBeforeEach(self);
            }
        });
        suite.afterEach(async () => {
            if (!self.netLink.isDestroyed) {
                self.netLink.disconnect();
            }
            await self.echo.stop();
        });
    }

    private hash(context: Mocha.Context): void {
        const id = context.currentTest?.fullTitle();
        if (!id) {
            throw new Error(`Cannot get full title for ${String(context)}`);
        }

        if (seenIds.has(id)) {
            throw new Error(`Duplicate test id detected: '${id}'`);
        } else {
            seenIds.add(id);
        }

        let port = minPort + (Math.abs(hashString(id)) % deltaPort);
        while (seenPorts.has(port) && port <= maxPort) {
            port += 1;
        }
        seenPorts.add(port);

        if (port > maxPort) {
            throw new Error(`Cannot find unused port for '${id}': ${port}`);
        }

        this.host = "localhost";
        this.port = port;
        this.str = id;
    }
}
