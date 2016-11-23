var netlinksocket = require('bindings')('netlinksocket');

module.exports = netlinksocket.NetLinkWrapper;

/**
 * Constructs a netlinkwrapper, taking no arguments
 *
 * @class netlinkwrapper
 * @classdesc A simple synchronous TCP module wrapping the netlink library for simple IO.
 */

/**
 * A synchronous version of net.Socket.connect(port[, host]).
 * Note: it does not accept a connectListener as part of the argument
 *
 * @function connect
 * @memberof netlinkwrapper
 * @instance
 * @param {number} port - the port to connect to
 * @param {string} [host="127.0.0.1"] - the host to connect to
 */

/**
 * Sets or gets if the socket is blocking
 *
 * @function blocking
 * @memberof netlinkwrapper
 * @instance
 * @param {undefined|boolean} [blocking] - if passed then acts as a setter boolean, if not passed then acts a getter
 * @returns {boolean|undefined} if using as a setter, returns undefined. If using as a getter gets if the socket is blocking
 */

/**
 * Reads a socket for data. Basically a replacement for on('data');
 *
 * @function read
 * @memberof netlinkwrapper
 * @instance
 * @param {number} buffer - How many bytes to read from the buffer
 * @param {boolean} [blocking] - If passed sets the blocking mode, as if you called blocking()
 * @return {string} the string read from the socket, or undefined if no data to read
 */

/**
 * Writes data to the socket
 *
 * @function write
 * @memberof netlinkwrapper
 * @instance
 * @param {string} data - data to write to the socket
 */

/**
 * Disconnects/Destroys the connection
 *
 * @function disconnect
 * @memberof netlinkwrapper
 * @instance
 */
