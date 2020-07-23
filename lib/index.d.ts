/// <reference types="node" />

export declare abstract class NetLinkSocketBase<
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
    isIPv4(): boolean;
    isIPv6(): boolean;
    isServer(): TType extends "server" ? true : false;
    isTCP(): TProtocal extends "TCP" ? true : false;
    isUDP(): TProtocal extends "UDP" ? true : false;
    setBlocking(blocking: boolean): void;
}

// -- Clients -- \\

declare class NetLinkSocketClient<
    TProtocal extends "TCP" | "UDP"
> extends NetLinkSocketBase<TProtocal, "client"> {
    constructor(hostTo: string, portTo: number, ipVersion?: "IPv4" | "IPv6");

    read(numBytes?: number): Buffer | undefined;
    write(data: string | Uint8Array | Buffer): void;
    getNextReadSize(): number;
}

export declare class NetLinkSocketClientTCP extends NetLinkSocketClient<
    "TCP"
> {}

export declare class NetLinkSocketClientUDP extends NetLinkSocketClient<
    "UDP"
> {
    constructor(
        hostTo: string,
        portTo: number,
        portFrom: number,
        ipVersion?: "IPv4" | "IPv6",
    );

    sendTo(data: Buffer, hostTo: string, portTo: number): void;
    readFrom(hostFrom: string, portFrom?: number, bufferSize?: number): Buffer;
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

    accept(): NetLinkSocketClient<TProtocal>;
    getListenQueue(): number;
}

export declare class NetLinkSocketServerTCP extends NetLinkSocketServer<
    "TCP"
> {
    accept(): NetLinkSocketClientTCP;
}

export declare class NetLinkSocketServerUDP extends NetLinkSocketServer<
    "UDP"
> {
    accept(): NetLinkSocketClientUDP;
}
