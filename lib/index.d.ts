/// <reference types="node" />

/**
 * The base socket all netlinkwrapper Socket instances inherit from.
 * No instances will ever, or can ever, be directly created from this class.
 * Instead this acts as a base class to check for `instanceOf` against all
 * the different socket classes. **Note:**: Attempting to use `new` against this
 * class will result in an exception being thrown.
 */
export declare abstract class NetLinkSocketBase<
    TProtocol extends "TCP" | "UDP" | undefined = undefined
> {
    /**
     * Disconnects this so. Once this is called the socket is considered
     * "destroyed" and no no longer be used for any form of communication.
     */
    disconnect(): void;

    /**
     * Gets the local port of the socket.
     *
     * @returns A number of the port listening from.
     */
    getPortFrom(): number;

    /**
     * Returns whether the socket is blocking (true) or not (false).
     *
     * @returns True if this socket is set to block, false otherwise.
     */
    isBlocking(): boolean;

    /**
     * Sets the blocking nature of the Socket. True if to block, false
     * otherwise.
     *
     * When a socket is blocking, calls such as receive() and accept() will
     * synchronously wait until there is data to return from those calls.
     * When a socket is not set to block, they will check and immediately return
     * undefined when there is no data from those calls.
     *
     * @param blocking - True if blocking should be enabled. False otherwise.
     */
    setBlocking(blocking: boolean): void;

    /**
     * Checks if the socket is Internet Protocol Version 4 (IPv4).
     *
     * @returns True if the socket is IPv4, false otherwise.
     */
    isIPv4(): boolean;

    /**
     * Checks if the socket is Internet Protocol Version 6 (IPv6).
     *
     * @returns True if the socket is IPv6, false otherwise.
     */
    isIPv6(): boolean;

    /**
     * Checks if the socket is a TCP socket. When true this must be a
     * NetLinkSocketClientTCP or NetLinkSocketServerTCP instance.
     *
     * @returns True if this is a TCP socket, false otherwise.
     */
    isTCP(): TProtocol extends "TCP"
        ? true
        : TProtocol extends "UDP"
        ? false
        : boolean;

    /**
     * Checks if the socket is a UDP socket. When true this must be a
     * NetLinkSocketUDP instance.
     *
     * @returns True if this is a UDP socket, false otherwise.
     */
    isUDP(): TProtocol extends "UDP"
        ? true
        : TProtocol extends "TCP"
        ? false
        : boolean;

    /**
     * Checks if this socket has been manually disconnected and thus destroyed.
     * Destroyed sockets cannot be re-used.
     *
     * **NOTE**: On unexpected socket errors this may not be set correctly. This
     * check can only ensure this socket was not unexpectedly disconnected.
     *
     * @returns True if this socket has been destroyed and disconnected. False
     * otherwise.
     */
    isDestroyed(): boolean;
}

/**
 * Represents a TCP Client connection.
 */
export declare class NetLinkSocketClientTCP extends NetLinkSocketBase<"TCP"> {
    /**
     * Creates, and then attempts to connect to a remote server given an
     * address. If no connection can be made, an Error is thrown.
     *
     * @param hostTo - The host of the address to connect this TCP client to.
     * @param portTo - The host of the address to connect this TCP client to.
     * @param ipVersion - An optional specific IP version to use. Defaults to
     * IPv4.
     */
    constructor(hostTo: string, portTo: number, ipVersion?: "IPv4" | "IPv6");

    /**
     * Returns the target host of the socket.
     *
     * @returns The host this socket is connected to.
     */
    getHostTo(): string;

    /**
     * Returns the port this socket is connected/sends to.
     *
     * @returns The port this socket is connected/sends to.
     */
    getPortTo(): number;

    /**
     * Attempts to Receive data from the server and return it as a Buffer.
     *
     * @returns A Buffer instance with the data read from the connected server.
     * If set to blocking this call will synchronously block until some data
     * is received. Otherwise if there is no data to receive, this will return
     * undefined immediately and not block.
     */
    receive(): Buffer | undefined;

    /**
     * Sends the data to the connected server.
     *
     * @param data - The data you want to send, as a string, Buffer, or
     * Uint8Array.
     */
    send(data: string | Buffer | Uint8Array): void;

    /**
     * Returns false as all TCP Clients are not servers.
     *
     * @returns Always false.
     */
    isServer(): false;

    /**
     * Returns True as all TCP Clients are clients.
     *
     * @returns Always true.
     */
    isClient(): true;
}

/**
 * Represents a TCP Server connection.
 */
export declare class NetLinkSocketServerTCP extends NetLinkSocketBase<"TCP"> {
    /**
     * Creates a TCP Server listening on a given port (an optional host) for
     * new TCP Client connections.
     *
     * @param portFrom - The local port the socket will be bound to.
     * @param hostFrom - The local address to be bound to
     * (example: "localhost" or "127.0.0.1").
     * Empty/undefined (by default) or "*" means all variable addresses.
     * @param ipVersion - The IP version to be used. IPv4 by default.
     */
    constructor(
        portFrom: number,
        hostFrom?: string,
        ipVersion?: "IPv4" | "IPv6",
    );

    /**
     * Listens for a new client connection, and accepts them, returning a new
     * `NetLinkSocketClientTCP` instance as an interface to send and receive
     * data from their connection.
     *
     * @returns When a new connection can be accepted, a new
     * `NetLinkSocketClientTCP` instance. If set to blocking this call will
     * synchronously block until a connect is made to accept and return.
     * Otherwise when not blocking and there is no connection to accept,
     * `undefined` is returned.
     */
    accept(): NetLinkSocketClientTCP | undefined;

    /**
     * Returns the socket local address. Empty string means any bound host.
     *
     * @returns The socket local address. Empty string means any bound host.
     */
    getHostFrom(): string;

    /**
     * Returns true as all TCP Servers are servers.
     *
     * @returns Always true.
     */
    isServer(): true;

    /**
     * Returns false as all TCP Servers are not clients.
     *
     * @returns Always false.
     */
    isClient(): false;
}

/**
 * Represents a UDP Datagram.
 */
export declare class NetLinkSocketUDP extends NetLinkSocketBase<"UDP"> {
    /**
     * Creates a UDP socket datagram with an address to use as the default
     * socket to send/receive from. Because UDP is connection-less unlike TCP,
     * no Error is thrown on construction if the host/port combo do no listen.
     *
     * @param hostTo - The default host to send/receive from.
     * @param portTo - The default port to send/receive from.
     * @param portFrom - An optional local port to bind to. If left undefined
     * then the local port of the socket is chosen by operating system.
     * @param ipVersion - The IP version to be used. IPv4 by default.
     */
    constructor(
        hostTo: string,
        portTo: number,
        // TODO: hostFrom?: string,
        portFrom?: number,
        ipVersion?: "IPv4" | "IPv6",
    );

    /**
     * Returns the target host of the socket.
     *
     * @returns The host this socket is connected to.
     */
    getHostTo(): string;

    /**
     * Returns the socket local address. Empty string means any bound host.
     *
     * @returns The socket local address. Empty string means any bound host.
     */
    getHostFrom(): string;

    /**
     * Returns the port this socket is connected/sends to.
     *
     * @returns The port this socket is connected/sends to.
     */
    getPortTo(): number;

    /**
     * Attempts to Receive data from the hostTo/portTo and return it as a
     * Buffer.
     *
     * @returns A Buffer instance with the data read from the hostTo/portTo.
     * If set to blocking this call will synchronously block until some data
     * is received. Otherwise if there is no data to receive, this will return
     * undefined immediately and not block.
     */
    receive(): Buffer | undefined;

    /**
     * Receive data from datagrams and returns the data and their address.
     *
     * @returns An object, containing the key `data` as a Buffer of the received
     * data. The address is present as key `host` and key `port`.
     */
    receiveFrom(): { host: string; port: number; data: Buffer } | undefined;

    /**
     * Sends the data to the default hostTo/portTo.
     *
     * @param data - The data you want to send, as a string, Buffer, or
     * Uint8Array.
     */
    send(data: string | Uint8Array | Buffer): void;

    /**
     * Sends to a specific datagram address some data.
     *
     * @param hostTo - The host string to send data to.
     * @param portTo - The port number to send data to.
     * @param data - The actual data payload to send. Can be a `string`,
     * `Buffer`, or `Uint8Array`.
     */
    sendTo(
        hostTo: string,
        portTo: number,
        data: string | Buffer | Uint8Array,
    ): void;
}
