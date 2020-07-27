/// <reference types="node" />

export declare abstract class NetLinkSocketBase<
    TProtocal extends "TCP" | "UDP" | undefined = undefined
> {
    disconnect(): void;

    getPortFrom(): number;

    isBlocking(): boolean;
    setBlocking(blocking: boolean): void;

    isIPv4(): boolean;
    isIPv6(): boolean;

    isTCP(): TProtocal extends "TCP"
        ? true
        : TProtocal extends "UDP"
        ? false
        : boolean;
    isUDP(): TProtocal extends "UDP"
        ? true
        : TProtocal extends "TCP"
        ? false
        : boolean;
}

export declare class NetLinkSocketClientTCP extends NetLinkSocketBase<"TCP"> {
    constructor(hostTo: string, portTo: number, ipVersion?: "IPv4" | "IPv6");

    getHostTo(): string;
    getPortTo(): number;

    receive(): Buffer | undefined;
    send(data: string | Uint8Array | Buffer): void;

    isServer(): false;
    isClient(): true;
}

export declare class NetLinkSocketServerTCP extends NetLinkSocketBase<"TCP"> {
    constructor(
        portFrom: number,
        hostFrom?: string,
        ipVersion?: "IPv4" | "IPv6",
    );

    getHostFrom(): string;

    isServer(): true;
    isClient(): false;

    accept(): NetLinkSocketClientTCP | undefined;
}

export declare class NetLinkSocketUDP extends NetLinkSocketBase<"UDP"> {
    constructor(
        hostTo: string,
        portTo: number,
        portFrom?: number,
        ipVersion?: "IPv4" | "IPv6",
    );

    getHostTo(): string;
    getHostFrom(): string;
    getPortTo(): number;

    receive(): Buffer | undefined;
    receiveFrom(): { host: string; port: number; data: Buffer } | undefined;

    send(data: string | Uint8Array | Buffer): void;
    sendTo(
        hostTo: string,
        portTo: number,
        data: string | Uint8Array | Buffer,
    ): void;
}
