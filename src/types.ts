export declare class NetLinkSocketBase<
    TIPVersion extends "IPv4" | "IPv6",
    TProtocal extends "TCP" | "UDP",
    TType extends "server" | "client"
> {
    disconnect(): void;
    getHostTo(): string;
    getHostFrom(): string;
    getPortTo(): string;
    getPortFrom(): number;
    getSocketHandler(): number;
    isBlocking(): boolean;
    isClient(): TType extends "client" ? true : false;
    isIPv4(): TIPVersion extends "IPv4" ? true : false;
    isIPv6(): TIPVersion extends "IPv6" ? true : false;
    isServer(): TType extends "server" ? true : false;
    isTCP(): TProtocal extends "TCP" ? true : false;
    isUDP(): TProtocal extends "UDP" ? true : false;
    setBlocking(blocking: boolean): void;
}

// -- Clients -- \\

export declare class NetLinkSocketClient<
    TIPVersion extends "IPv4" | "IPv6",
    TProtocal extends "TCP" | "UDP"
> extends NetLinkSocketBase<TIPVersion, TProtocal, "client"> {
    constructor(hostTo: string, portTo: number, ipVersion?: TIPVersion);

    read(numBytes?: number): Buffer | undefined;
    write(data: string | Uint8Array | Buffer): void;
    getNextReadSize(): number;
}

export declare class NetLinkSocketClientTCP<
    TIPVersion extends "IPv4" | "IPv6"
> extends NetLinkSocketClient<TIPVersion, "TCP"> {}

export declare class NetLinkSocketClientUDP<
    TIPVersion extends "IPv4" | "IPv6"
> extends NetLinkSocketClient<TIPVersion, "UDP"> {
    constructor(
        hostTo: string,
        portTo: number,
        portFrom: number,
        ipVersion?: TIPVersion,
    );

    sendTo(data: Buffer, hostTo: string, portTo: number): void;
    readFrom(hostFrom: string, portFrom?: number, bufferSize?: number): Buffer;
}

// -- Servers -- \\

export declare class NetLinkSocketServer<
    TIPVersion extends "IPv4" | "IPv6",
    TProtocal extends "TCP" | "UDP"
> extends NetLinkSocketBase<TIPVersion, TProtocal, "server"> {
    constructor(
        portFrom: number,
        hostFrom?: string,
        ipVersion?: TIPVersion,
        listenQueue?: number | undefined,
    );

    accept(): NetLinkSocketClient<TIPVersion, TProtocal>;
    getListenQueue(): number;
}

export declare class NetLinkSocketServerTCP<
    TIPVersion extends "IPv4" | "IPv6"
> extends NetLinkSocketBase<TIPVersion, "TCP", "server"> {
    accept(): NetLinkSocketClientTCP<TIPVersion>;
}

export declare class NetLinkSocketServerUDP<
    TIPVersion extends "IPv4" | "IPv6"
> extends NetLinkSocketBase<TIPVersion, "UDP", "server"> {
    accept(): NetLinkSocketClientUDP<TIPVersion>;
}
