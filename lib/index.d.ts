/// <reference types="node" />

/**
 * The base socket all netlinkwrapper Socket instances inherit from.
 * No instances will ever, or can ever, be directly created from this class.
 * Instead this acts as a base class to check for `instanceOf` against all
 * the different socket classes. **Note:**: Attempting to use `new` against this
 * class will result in an exception being thrown.
 */
export declare abstract class SocketBase {
    /**
     * Disconnects this so. Once this is called the socket is considered
     * "destroyed" and no no longer be used for any form of communication.
     */
    disconnect(): void;

    /**
     * The local port the socket is bound to.
     */
    readonly portFrom: number;

    /**
     * Gets/sets the blocking nature of the Socket. True if to block, false
     * otherwise.
     *
     * When a socket is blocking, calls such as receive() and accept() will
     * synchronously wait until there is data to return from those calls.
     * When a socket is not set to block, they will check and immediately return
     * undefined when there is no data from those calls.
     */
    isBlocking: boolean;

    /**
     * Flag if this socket has been manually disconnected and thus destroyed.
     * Destroyed sockets cannot be re-used. True if this socket has been
     * destroyed and disconnected. False otherwise.
     *
     * **NOTE**: On unexpected socket errors this may not be set correctly. This
     * check can only ensure this socket disconnected in an expected fashion.
     */
    readonly isDestroyed: boolean;

    /**
     * Flag if the socket is Internet Protocol Version 4 (IPv4).
     */
    readonly isIPv4: boolean;

    /**
     * Flag if the socket is Internet Protocol Version 6 (IPv6).
     */
    readonly isIPv6: boolean;
}

/**
 * Represents a TCP Client connection.
 */
export declare class SocketClientTCP extends SocketBase {
    /**
     * Creates, and then attempts to connect to a remote server given an
     * address. If no connection can be made, an Error is thrown.
     *
     * @param portTo - The host of the address to connect this TCP client to.
     * @param hostTo - The host of the address to connect this TCP client to.
     * @param ipVersion - An optional specific IP version to use. Defaults to
     * IPv4.
     */
    constructor(portTo: number, hostTo: string, ipVersion?: "IPv4" | "IPv6");

    /**
     * The target host of the socket.
     */
    readonly hostTo: string;

    /**
     * The port this socket is connected/sends to.
     */
    readonly portTo: number;

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
}

/**
 * Represents a TCP Server connection.
 */
export declare class SocketServerTCP extends SocketBase {
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
     * `SocketClientTCP` instance as an interface to send and receive
     * data from their connection.
     *
     * @returns When a new connection can be accepted, a new
     * `SocketClientTCP` instance. If set to blocking this call will
     * synchronously block until a connect is made to accept and return.
     * Otherwise when not blocking and there is no connection to accept,
     * `undefined` is returned.
     */
    accept(): SocketClientTCP | undefined;

    /**
     * Gets the socket local address. Empty string means any bound host.
     */
    readonly hostFrom: string;
}

/**
 * Represents a UDP Datagram.
 */
export declare class SocketUDP extends SocketBase {
    /**
     * Creates a UDP socket datagram with an address to use as the default
     * socket to send/receive from. Because UDP is connection-less unlike TCP,
     * no Error is thrown on construction if the host/port combo do no listen.
     *
     * @param portFrom - An optional local port to bind to. If left undefined
     * then the local port of the socket is chosen by operating system.
     * @param hostFrom - An optional address to bind to. If left undefined,
     * empty string, or "*", then the operating system attempts to bind
     * to all local addresses.
     * @param ipVersion - The IP version to be used. IPv4 by default.
     */
    constructor(
        portFrom?: number,
        hostFrom?: string,
        ipVersion?: "IPv4" | "IPv6",
    );

    /**
     * The socket local address. Empty string means any bound host.
     */
    readonly hostFrom: string;

    /**
     * Receive data from datagrams and returns the data and their address.
     *
     * @returns An object, containing the key `data` as a Buffer of the received
     * data. The address is present as key `host` and key `port`.
     */
    receiveFrom(): { host: string; port: number; data: Buffer } | undefined;

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
