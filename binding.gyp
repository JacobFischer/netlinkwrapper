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
      "libraries": ["ws2_32.lib"]
    }
  ]
}
