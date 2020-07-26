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

    static v8::Persistent<v8::Function> constructor;
    static v8::Persistent<v8::FunctionTemplate> class_socket_base;
    static v8::Persistent<v8::FunctionTemplate> class_socket_client_tcp;
    static v8::Persistent<v8::FunctionTemplate> class_socket_client_udp;

    static void new_base(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_client_tcp(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_client_udp(const v8::FunctionCallbackInfo<v8::Value> &args);

    static void accept(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void disconnect(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_host_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_host_to(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_listen_queue(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_next_read_size(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_port_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_port_to(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void get_socket_handler(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_blocking(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_client(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_ipv4(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_ipv6(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_server(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_tcp(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void is_udp(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void read(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void read_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void set_blocking(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void write(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void write_to(const v8::FunctionCallbackInfo<v8::Value> &args);
};

#endif
