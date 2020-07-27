#ifndef NETLINKOBJECT_H
#define NETLINKOBJECT_H

#include <node.h>
#include <node_object_wrap.h>
#include <memory>
#include "netlink/socket.h"

class NetLinkWrapper : public node::ObjectWrap
{
public:
    static void init(v8::Local<v8::Object> exports);

private:
    std::unique_ptr<NL::Socket> socket;
    bool destroyed = false;

    explicit NetLinkWrapper(NL::Socket *socket);
    ~NetLinkWrapper();

    static v8::Persistent<v8::FunctionTemplate> class_socket_base;
    static v8::Persistent<v8::FunctionTemplate> class_socket_tcp_client;
    static v8::Persistent<v8::FunctionTemplate> class_socket_tcp_server;
    static v8::Persistent<v8::FunctionTemplate> class_socket_udp;

    static void new_base(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_tcp_client(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_tcp_server(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_udp(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void accept(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void disconnect(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_host_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_host_to(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_port_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_port_to(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_blocking(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_client(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_ipv4(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_ipv6(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_server(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_tcp(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_udp(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void receive(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void receive_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void set_blocking(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void send(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void send_to(const v8::FunctionCallbackInfo<v8::Value> &args);
};

#endif
