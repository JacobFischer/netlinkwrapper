/* eslint-disable mocha/no-exports */
import { EchoSocket } from "./echo-socket";
import { SocketBase } from "../../lib";
import { permutations } from "./permutations";
import { badArg } from "./bad-arg";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

const MAX_PORT = 65535;
let nextPort = 50_000;

/**
 * Gets the next testing port. Use this to ensure each test has a unique port.
 *
 * @returns A number representing a port to test on.
 */
export function getNextTestingPort(): number {
    const result = nextPort;
    nextPort += 1;
    if (nextPort > 60_000) {
        // something went really wrong
        throw new Error("Too many ports used!");
    }

    return result;
}

const seenIds = new Set<string>();

const getTestingString = (context: Mocha.Context): string => {
    const id = context.currentTest?.fullTitle();
    if (!id) {
        throw new Error(`Cannot get full title for ${String(context)}`);
    }

    if (seenIds.has(id)) {
        throw new Error(`Duplicate test id detected: '${id}'`);
    } else {
        seenIds.add(id);
    }

    return id;
};

const prettyString = (arg: unknown) =>
    typeof arg === "string"
        ? arg === "number" || arg === "string"
            ? arg
            : `"${arg}"`
        : String(arg);

/**
 * Prettifies with args for human reading.
 *
 * @param port - The port being used.
 * @param host - The host being used.
 * @param ipVersion - The ipVersion being used.
 * @returns A string for use in Mocha descriptions about what with.
 */
const prettyWithDescription = (
    port: unknown,
    host: unknown,
    ipVersion: unknown,
): string =>
    `with
 port: ${prettyString(port)},
 host: ${prettyString(host)},
 ip: ${prettyString(ipVersion)}
`.replace(/\n/g, "");

export type BaseTesting<
    TNetLink extends SocketBase,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TEchoSocket extends EchoSocket<any>
> = Readonly<{
    host: string;
    port: number;
    ipVersion: "IPv4" | "IPv6";
    constructorArgs: {
        host: string | undefined;
        port: number | undefined;
        ipVersion: "IPv4" | "IPv6" | undefined;
    };
    str: string;
    netLink: TNetLink;
    echo: TEchoSocket;
    settableNetLink: Writeable<TNetLink>;
}>;

export class Tester<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TNetLinkClass extends { new (...args: any[]): SocketBase },
    TEchoSocketClass extends {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (...args: any[]): TEchoSocket;
    },
    TNetLink extends SocketBase = InstanceType<TNetLinkClass>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TEchoSocket extends EchoSocket<any> = InstanceType<TEchoSocketClass>,
    TTesting extends BaseTesting<TNetLink, TEchoSocket> = BaseTesting<
        TNetLink,
        TEchoSocket
    >
> {
    private readonly constructorArgs: [
        boolean,
        boolean,
        "IPv4" | "IPv6" | undefined,
    ][];
    private readonly invalidConstructorArgs: [unknown, unknown, unknown][];
    private readonly startEchoAfterNetLink: boolean;
    private readonly alsoBeforeEach?: (testing: TTesting) => Promise<void>;
    public readonly testing = badArg<TTesting>();

    constructor(
        public readonly NetLinkClass: TNetLinkClass,
        private readonly EchoSocketClass: TEchoSocketClass,
        options?: {
            newPermute?: ("port" | "host")[];
            startEchoAfterNetLink?: boolean;
            alsoBeforeEach?: (testing: TTesting) => Promise<void>;
        },
    ) {
        this.startEchoAfterNetLink = Boolean(options?.startEchoAfterNetLink);
        this.alsoBeforeEach = options?.alsoBeforeEach;

        const permutePort = options?.newPermute?.includes("port");
        const permuteHost = options?.newPermute?.includes("host");
        this.constructorArgs = permutations(
            ...([
                permutePort ? [true, false] : [true],
                permuteHost ? [true, false] : [true],
                ["IPv4", "IPv6", undefined] as const,
            ] as const),
        );

        const validPort = 12345;
        const isValid = new Set(
            this.constructorArgs.map(([usePort, useHost, ipVersion]) =>
                JSON.stringify(
                    [
                        usePort ? validPort : undefined,
                        useHost ? "localhost" : undefined,
                        ipVersion,
                    ].map(String),
                ),
            ),
        );

        this.invalidConstructorArgs = permutations(
            [validPort, -1337, 0, MAX_PORT + 1, undefined, badArg()],
            ["localhost", undefined, badArg()],
            ["IPv4", "IPv6", undefined, "some string", badArg()],
        ).filter((args) => !isValid.has(JSON.stringify(args.map(String))));
    }

    public permutations(
        descriptionPrefix: string,
        callback: (
            args: {
                usePort: boolean;
                useHost: boolean;
                ipVersion: "IPv4" | "IPv6" | undefined;
            },
            suite: Mocha.Suite,
        ) => void,
    ): void {
        const { constructorArgs } = this;
        const description = [
            descriptionPrefix,
            this.NetLinkClass.name,
            "permutations",
        ]
            .filter(Boolean)
            .join(" ");
        describe(description, function () {
            for (const [usePort, useHost, ipVersion] of constructorArgs) {
                const withDescription = prettyWithDescription(
                    usePort ? "number" : undefined,
                    useHost ? "string" : undefined,
                    ipVersion,
                );
                describe(withDescription, function () {
                    callback({ usePort, useHost, ipVersion }, this);
                });
            }
        });
    }

    public testPermutations(callback: (testing: TTesting) => void): void {
        const { alsoBeforeEach, NetLinkClass, startEchoAfterNetLink } = this;
        this.permutations("", ({ usePort, useHost, ipVersion }, suite) => {
            const testing = {
                host: "localhost",
                port: 1,
                ipVersion: ipVersion || "IPv4",
                constructorArgs: {
                    host: useHost ? "localhost" : undefined,
                    port: usePort ? 1 : undefined,
                    ipVersion,
                },
                str: "",
                netLink: (null as unknown) as TNetLink,
                echo: new this.EchoSocketClass(),
                settableNetLink: (null as unknown) as Writeable<TNetLink>,
            } as Writeable<TTesting>;

            suite.beforeEach(async function () {
                testing.str = getTestingString(this);
                testing.port = getNextTestingPort();
                if (testing.constructorArgs.port) {
                    testing.constructorArgs.port = testing.port;
                }

                if (!startEchoAfterNetLink) {
                    await testing.echo.start(testing);
                }
                testing.netLink = new NetLinkClass(
                    testing.constructorArgs.port,
                    testing.constructorArgs.host,
                    testing.constructorArgs.ipVersion,
                ) as TNetLink;

                testing.settableNetLink = testing.netLink;
                if (startEchoAfterNetLink) {
                    await testing.echo.start(testing);
                }

                if (alsoBeforeEach) {
                    await alsoBeforeEach(testing);
                }
            });

            suite.afterEach(async () => {
                if (testing.netLink && !testing.netLink.isDestroyed) {
                    testing.netLink.disconnect();
                }
                await testing.echo.stop();
            });

            callback(testing);
        });
    }

    public testInvalidPermutations(
        callback: (port: unknown, host: unknown, ipVersion: unknown) => void,
    ): void {
        const desc = `for ${this.NetLinkClass.name} invalid constructor args`;
        const { invalidConstructorArgs } = this;
        describe(desc, function () {
            for (const args of invalidConstructorArgs) {
                describe(prettyWithDescription(...args), function () {
                    callback(...args);
                });
            }
        });
    }
}
