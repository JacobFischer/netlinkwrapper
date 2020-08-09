# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog]
and this project adheres to [Semantic Versioning].

## [2.0.0] - 2020-08-09
### Changes
- **Breaking**: The entire shape of this package has been modified and expanded
  - The `NetLinkWrapper` constructor is removed, and is no longer the only
    export
  - `SocketClientTCP` functionally replaces `NetLinkWrapper`
    - It is a named export of the same name of this module now
  - `.connect` no longer exists. Instead connections are attempted to form
  during the constructor call
  - All constructors must be invoked with the `new` keyword
    - Failure to do so will result in an Error being thrown
  - `.blocking()` now is now a property `.isBlocking`
    - Setting it to a boolean will change the blocking nature of the socket
  - `.write()` renamed to `.send()`
    - Will now accept a `Buffer`, `string`, or `Uint8Array` typed value to send,
      instead of only a `string` [#15]
  - `.read()` renamed to `.receive()`
    - No longer requires (or accepts) a buffer size argument
    - Now returns a `Buffer` instance instead of a `string`
- **Important**: The entire middleware component of this module has been
  re-written
  - It is recommended that you review the docs to see what has changed and been
    added

### Added
- **New**: `SocketUDP` added for UDP usage
  - Can send and/or receive from other UDP sockets
- **New**: `SocketServerTCP` added for TCP server usage
  - Can bind and listen to an address for new TCP clients
- All socket classes can be manually specified to `IPv4` or `IPv6`
  - Defaults to `IPv4`
  - After constructed this can be checked via the `isIPv4` and `isIPv6` flags
    - Note: These cannot be set/changed these after construction, and attempting
      to do so will result in an Error being thrown
- Sockets expose their `hostFrom`, `portFrom` (TCP Server/UDP), and `hostTo`
  , `portTo` (TCP Client) as properties
  - Note: These cannot be changed/set after constructed, and attempting to do so
    will result in an Error being thrown
- See the [documentation] for full details on these new classes and
functionality
- Once `.disconnect()` is called, the new `isDestroyed` flag will be set from
  `false` to `true`
  - Note: This cannot be manually set, and attempting to do so will result in an
    Error being thrown

### Fixes
- node-gyp C++ build warnings on Windows systems resolved

## [1.2.1] - 2020-01-07
### Security
- Updated dependencies to latest to resolve security concerns

## [1.2.0] - 2020-01-01
### Fixed
- Support for Node v13 builds [#13], [#14]
- Fixes build warnings for unused variable `value_`
### Changed
- Node v6 is no longer LTS thus dropped from support here

## [1.1.2] - 2019-07-03
### Fixed
- Fixes for node supporting versions 6 through 12 (current) [#9]

## [1.1.1] - 2018-09-26
### Fixed
- Fix for building against musl libc [#6]

## [1.1.0] - 2018-09-01
### Fixed
- Build now works with Node.js v10 [#4]
- Updated dependencies to latest to resolve security concerns

### Added
- TypeScript definitions
- This changelog!
- TravisCI integration

## [1.0.0] - 2016-11-22
### Fixed
- OSX builds working [#2]

### Added
- Documentation in JSDoc format

## [0.0.1] - 2015-11-23
- Initial release

[#15]: https://github.com/JacobFischer/netlinkwrapper/issues/15
[#14]: https://github.com/JacobFischer/netlinkwrapper/pull/14
[#13]: https://github.com/JacobFischer/netlinkwrapper/pull/13
[#9]: https://github.com/JacobFischer/netlinkwrapper/pull/9
[#6]: https://github.com/JacobFischer/netlinkwrapper/pull/6
[#4]: https://github.com/JacobFischer/netlinkwrapper/pull/4
[#2]: https://github.com/JacobFischer/netlinkwrapper/pull/2

[2.0.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v2.0.0
[1.2.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.2.1
[1.2.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.2.0
[1.1.2]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.2
[1.1.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.1
[1.1.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.0
[1.0.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.0.0
[0.0.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v0.0.1

[documentation]: https://jacobfischer.github.io/netlinkwrapper/

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html
