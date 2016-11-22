{
  "targets": [
    {
      "target_name": "netlinksocket",
      "sources": [ "netlinksocket.cc", "netlinkwrapper.cc",
        "netlink/core.cc",
        "netlink/smart_buffer.cc",
        "netlink/socket.cc",
        "netlink/socket_group.cc",
        "netlink/util.cc"
      ],
      "cflags!": [ "-fexceptions" ],
      "cflags_cc!": [ "-fexceptions" ],
      "conditions": [
        ['OS=="win"', {
          "libraries": [ "ws2_32.lib" ]
        },
         'OS=="mac"', {
          "xcode_settings": {
              "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
          }
         }]
      ]
    }
  ]
}
