# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog]
and this project adheres to [Semantic Versioning].

## [2.0.0] - 2020-17-7
### Changes
- **Breaking**: The entire shape of this package has been modified and extended
  - The `NetLinkWrapper` constructor is removed, and no longer the only export
  - `NetLinkSocketClientTCP` functionally replaces `NetLinkWrapper`. It is a
  named export of the same name of this module now
  - `.connect` no longer exists. Instead connections are attemper to form
  during the constructor call
  - All constructors must be invoked with the `new` keyword. Failure to do so
  will result in an exception being thrown
  - `.blocking()` now separated into `.setBlocking()` and `.getBlocking()`
  - `.write()` renamed to `.send()`, and can take `Buffer`, `string`, or
  `Uint8Array` typed values to send.
  - `.read()` renamed to `.receive()`, also no longer requires buffer size, and
  now returns a `Buffer` instance instead of a string
- **Important**: The entire middleware pertain of this module has been
  re-written. It is recommended  that you review the docs to see what has
  changed and been added

### Fixes
- node-gyp C++ build warnings across all operating systems should be fixed

### Added
- **New**: `NetLinkSocketUDP` added for UDP usage
- **New**: `NetLinkSocketServerTCP` added for TCP server usage

## [1.2.1] - 2020-11-7
### Security
- Updated dependencies to latest to resolve security concerns

## [1.2.0] - 2020-1-1
### Fixed
- Support for Node v13 builds [#13], [#14]
- Fixes build warnings for unused variable `value_`
### Changed
- Node v6 is no longer LTS thus dropped from support here

## [1.1.2] - 2019-7-3
### Fixed
- Fixes for node supporting versions 6 through 12 (current) [#9]

## [1.1.1] - 2018-9-26
### Fixed
- Fix for building against musl libc [#6]

## [1.1.0] - 2018-9-1
### Fixed
- Build now works with Node.js v10 [#4]
- Updated dependencies to latest to resolve security concerns

### Added
- TypeScript definitions.
- This changelog!
- TravisCI integration

## [1.0.0] - 2016-11-22
### Fixed
- OSX builds working [#2]

### Added
- Documentation in JSDoc format

## [0.0.1] - 2015-11-23
- Initial release

[#14]: https://github.com/JacobFischer/netlinkwrapper/pull/14
[#13]: https://github.com/JacobFischer/netlinkwrapper/pull/13
[#9]: https://github.com/JacobFischer/netlinkwrapper/pull/9
[#6]: https://github.com/JacobFischer/netlinkwrapper/pull/6
[#4]: https://github.com/JacobFischer/netlinkwrapper/pull/4
[#2]: https://github.com/JacobFischer/netlinkwrapper/pull/2

[1.2.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.2.1
[1.2.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.2.0
[1.1.2]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.2
[1.1.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.1
[1.1.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.1.0
[1.0.0]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v1.0.0
[0.0.1]: https://github.com/JacobFischer/netlinkwrapper/releases/tag/v0.0.1

[Keep a Changelog]: http://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: http://semver.org/spec/v2.0.0.html
