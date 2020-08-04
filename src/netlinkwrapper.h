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

    /* -- Class Constructors -- */
    static void new_base(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_tcp_client(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_tcp_server(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void new_udp(const v8::FunctionCallbackInfo<v8::Value> &args);

    /* -- Methods -- */
    static void accept(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void disconnect(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void receive(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void receive_from(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void set_blocking(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void send(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void send_to(const v8::FunctionCallbackInfo<v8::Value> &args);

    /* -- Getters -- */
    static void getter_host_from(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_host_to(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_port_from(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_port_to(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);

    static void getter_is_blocking(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_is_destroyed(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_is_ipv4(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);
    static void getter_is_ipv6(
        v8::Local<v8::String>,
        const v8::PropertyCallbackInfo<v8::Value> &info);

    /* -- Setters -- */
    static void setter_throw_exception(
        v8::Local<v8::String>,
        v8::Local<v8::Value>,
        const v8::PropertyCallbackInfo<void> &);
    static void setter_is_blocking(
        v8::Local<v8::String>,
        v8::Local<v8::Value> value,
        const v8::PropertyCallbackInfo<void> &info);
};

#endif
