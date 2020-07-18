/**
 * A simple synchronous TCP module wrapping the netlink library for simple
 * IO.
 */
export declare class NetLinkWrapper {
    /**
     * Constructs a netlinkwrapper, taking no arguments
     * NOTE: It is not connected to anything after creations. Use `connect`
     * for that.
     */
    constructor();

    /**
     * A synchronous version of net.Socket.connect(port[, host]).
     * Note: it does not accept a connectListener as part of the argument.
     *
     * @param port - The port to connect to.
     * @param host - The host to connect to, defaults to `127.0.0.1`.
     */
    connect(port: number, host?: string): void;

    /**
     * Sets if the socket is blocking or not.
     *
     * @param blocking - Required. True to set to block, false to disable
     * blocking.
     */
    blocking(blocking: boolean): void;

    /**
     * Gets if the socket is currently set to block or not.
     *
     * @returns True if set to block. False if not blocking.
     */
    blocking(): boolean;

    /**
     * Sets or gets if the socket is blocking. When passed a boolean sets
     * if blocking. When omitted gets if blocking.
     *
     * @param blocking - If passed then acts as a setter boolean,
     * if not passed then acts a getter.
     * @returns If using as a setter, returns undefined. If using as a
     * getter gets if the socket is blocking.
     */
    blocking(blocking?: boolean): boolean | void;

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
const mod: { NetLinkWrapper: typeof NetLinkWrapper } = bindings(
    "netlinksocket",
);

export const netLinkWrapper = mod.NetLinkWrapper;
export default netLinkWrapper;
