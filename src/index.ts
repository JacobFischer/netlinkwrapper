/**
 * A simple synchronous TCP module wrapping the netlink library for simple
 * IO.
 */
export declare class NetLinkSocketBaseClass {
    /**
     * A synchronous version of net.Socket.connect(port[, host]).
     * Note: it does not accept a connectListener as part of the argument.
     *
     * @param host - The host to connect to.
     * @param port - The port to connect to.
     */
    constructor(host: string, port: number);

    /**
     * Sets if the socket is blocking or not.
     *
     * @param blocking - Required. True to set to block, false to disable
     * blocking.
     */
    setBlocking(blocking: boolean): void;

    /**
     * Gets if the socket is currently set to block or not.
     *
     * @returns True if set to block. False if not blocking.
     */
    getBlocking(): boolean;

    /**
     * Reads a socket for data. Basically a replacement for on('data');.
     *
     * @param {number} numBytes - How many bytes to read from the buffer.
     * @param {boolean} blocking - If passed sets the blocking mode,
     * the same as if you called `blocking()` prior to calling `read()`.
     * @returns The string read from the socket,
     * or undefined if no data to read.
     */
    read(numBytes: number, blocking?: boolean): Buffer | undefined;

    /**
     * Writes data to the socket.
     *
     * @param {string} data - The data to write to the socket.
     */
    write(data: string | Uint8Array | Buffer): void;

    /**
     * Disconnects/Destroys the connection.
     */
    disconnect(): void;
}

import bindings from "bindings";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mod: {
    NetLinkSocketBase: typeof NetLinkSocketBaseClass;
    NetLinkSocketClientTCP: typeof NetLinkSocketBaseClass;
} = bindings("netlinksocket");

export const NetLinkSocketBase = mod.NetLinkSocketBase;
export const NetLinkSocketClientTCP = mod.NetLinkSocketClientTCP;
