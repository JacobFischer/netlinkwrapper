{
  "targets": [
    {
      "target_name": "netlinksocket",
      "sources": [
        "src/netlinksocket.cc",
        "src/netlinkwrapper.cc",
        "src/netlink/core.cc",
        "src/netlink/smart_buffer.cc",
        "src/netlink/socket.cc",
        "src/netlink/socket_group.cc",
        "src/netlink/util.cc"
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
      ],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": "1",
          "AdditionalOptions": ["/EHsc"]
        }
      }
    }
  ]
}
