{
  "targets": [
    {
      "target_name": "netlinksocket",
      "sources": [
        "src/cpp/netlinksocket.cc",
        "src/cpp/netlinkwrapper.cc",
        "src/cpp/netlink/core.cc",
        "src/cpp/netlink/smart_buffer.cc",
        "src/cpp/netlink/socket.cc",
        "src/cpp/netlink/socket_group.cc",
        "src/cpp/netlink/util.cc"
      ],
      "cflags": [ "-fexceptions" ],
      "cflags_cc": [ "-fexceptions" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        [
          'OS=="win"', {
            "libraries": [ "ws2_32.lib" ]
          },
          'OS=="mac"', {
            "xcode_settings": {
                "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
            }
          }
        ]
      ],
      "include_dirs" : [
          "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
