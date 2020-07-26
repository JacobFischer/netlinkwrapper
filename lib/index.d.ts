/// <reference types="node" />

export declare abstract class NetLinkSocketBase<
    TProtocal extends "TCP" | "UDP" | undefined = undefined,
    TType extends "server" | "client" | undefined = undefined
> {
    disconnect(): void;
    getHostTo(): string;
    getHostFrom(): string;
    getPortTo(): number;
    getPortFrom(): number;
    getSocketHandler(): number;
    isBlocking(): boolean;
    isClient(): TType extends "client"
        ? true
        : TType extends "server"
        ? false
        : boolean;
    isIPv4(): boolean;
    isIPv6(): boolean;
    isServer(): TType extends "server"
        ? true
        : TType extends "client"
        ? false
        : boolean;
    isTCP(): TProtocal extends "TCP"
        ? true
        : TType extends "UDP"
        ? false
        : boolean;
    isUDP(): TProtocal extends "UDP"
        ? true
        : TType extends "TCP"
        ? false
        : boolean;
    setBlocking(blocking: boolean): void;
}

// -- Clients -- \\

declare class NetLinkSocketClient<
    TProtocal extends "TCP" | "UDP"
> extends NetLinkSocketBase<TProtocal, "client"> {
    constructor(hostTo: string, portTo: number, ipVersion?: "IPv4" | "IPv6");

    read(): Buffer | undefined;
    write(data: string | Uint8Array | Buffer): void;
    getNextReadSize(): number;
}

export declare class NetLinkSocketClientTCP extends NetLinkSocketClient<
    "TCP"
> {}

export declare class NetLinkSocketClientUDP extends NetLinkSocketClient<
    "UDP"
> {
    constructor(hostTo: string, portTo: number, ipVersion?: "IPv4" | "IPv6");
    constructor(
        hostTo: string,
        portTo: number,
        portFrom?: number,
        ipVersion?: "IPv4" | "IPv6",
    );

    writeTo(
        hostTo: string,
        portTo: number,
        data: string | Uint8Array | Buffer,
    ): void;
    readFrom(): {
        host: string;
        port: number;
        data: Buffer;
    };
}

// -- Servers -- \\

declare class NetLinkSocketServer<
    TProtocal extends "TCP" | "UDP"
> extends NetLinkSocketBase<TProtocal, "server"> {
    constructor(
        portFrom: number,
        hostFrom?: string,
        ipVersion?: "IPv4" | "IPv6",
        listenQueue?: number | undefined,
    );
}

export declare class NetLinkSocketServerTCP extends NetLinkSocketServer<
    "TCP"
> {
    accept(): NetLinkSocketClientTCP;
    getListenQueue(): number;
}

export declare class NetLinkSocketServerUDP extends NetLinkSocketServer<
    "UDP"
> {}
