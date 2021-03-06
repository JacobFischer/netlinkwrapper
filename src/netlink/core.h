/*
    NetLink Sockets: Networking C++ library
    Copyright 2012 Pedro Francisco Pareja Ruiz (PedroPareja@Gmail.com)

    This file is part of NetLink Sockets.

    NetLink Sockets is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    NetLink Sockets is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with NetLink Sockets. If not, see <http://www.gnu.org/licenses/>.

*/

/**
* @file core.h
* NetLink core types and init
*/


#ifndef __NL_CORE
#define __NL_CORE

#include "config.h"

#define NL_NAMESPACE_NAME NL

#define NL_NAMESPACE namespace NL_NAMESPACE_NAME {
#define NL_NAMESPACE_END };
#define NL_NAMESPACE_USE using namespace NL_NAMESPACE_NAME;


#if defined(_WIN32) || defined(__WIN32__) || defined(_MSC_VER)

    #define OS_WIN32
    // #define _WIN32_WINNT 0x501


    #include <winsock2.h>
    #include <ws2tcpip.h>

    // Requires Win7 or Vista
    // Link to Ws2_32.lib library

    # if defined(_MSC_VER) && _MSC_VER < 1900
    # define snprintf _snprintf_s
    # endif

#else

    #define OS_LINUX

    #include <arpa/inet.h>
    #include <fcntl.h>
    #include <sys/types.h>
    #include <sys/socket.h>
    #include <unistd.h>
    #include <sys/time.h>
    #include <netdb.h>
    #include <sys/ioctl.h>
    #include <errno.h>
    #include <unistd.h>

#endif


#include <string>


NL_NAMESPACE

using std::string;


void init();


/**
* @enum Protocol
*
* Defines protocol type.
*/

enum Protocol {

    TCP,	/**< TCP Protocol*/
    UDP		/**< UDP Protocol*/
};


/**
* @enum IPVer
*
* Defines the version of IP.
*/

enum IPVer {

    IP4,	/**< IP version 4*/
    IP6,	/**< IP version 6*/
    ANY		/**< Any IP version*/
};


/**
* @enum SocketType
*
* Defines the nature of the socket.
*/

enum SocketType {

    CLIENT,     /**< TCP or UDP socket connected or directed to a target host*/
    SERVER      /**< TCP socket which listens for connections or UDP socket without target host*/
};

NL_NAMESPACE_END


#include "exception.h"
#include "release_manager.h"
#include "util.h"

#endif
