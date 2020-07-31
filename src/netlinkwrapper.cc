#define NOMINMAX
#include <algorithm>
#include <array>
#include <cstdint>
#include <iostream>
#include <limits>
#include <nan.h>
#include <sstream>
#include <vector>
#include "arg_parser.h"
#include "netlinkwrapper.h"
#include "netlink/exception.h"

#define READ_SIZE 255

v8::Persistent<v8::FunctionTemplate> NetLinkWrapper::class_socket_base;
v8::Persistent<v8::FunctionTemplate> NetLinkWrapper::class_socket_tcp_client;
v8::Persistent<v8::FunctionTemplate> NetLinkWrapper::class_socket_tcp_server;
v8::Persistent<v8::FunctionTemplate> NetLinkWrapper::class_socket_udp;

NetLinkWrapper::NetLinkWrapper(NL::Socket *socket)
{
    this->socket = std::unique_ptr<NL::Socket>(socket);
}

NetLinkWrapper::~NetLinkWrapper()
{
    this->socket.release();
}

void NetLinkWrapper::init(v8::Local<v8::Object> exports)
{
    auto isolate = v8::Isolate::GetCurrent();

    // https://stackoverflow.com/questions/28076382/v8-inherited-functiontemplate-not-getting-updates-to-the-parent-functiontemplate

    // -- Base --
    auto name_base = Nan::New("NetLinkSocketBase").ToLocalChecked();
    auto base_template = v8::FunctionTemplate::New(isolate, new_base);
    base_template->SetClassName(name_base);
    base_template->InstanceTemplate()->SetInternalFieldCount(1);

    NODE_SET_PROTOTYPE_METHOD(base_template, "disconnect", disconnect);
    NODE_SET_PROTOTYPE_METHOD(base_template, "getPortFrom", get_port_from);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isBlocking", is_blocking);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isDestroyed", is_destroyed);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isIPv4", is_ipv4);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isIPv6", is_ipv6);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isTCP", is_tcp);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isUDP", is_udp);
    NODE_SET_PROTOTYPE_METHOD(base_template, "setBlocking", set_blocking);

    // -- TCP Client --
    auto name_tcp_client = Nan::New("NetLinkSocketClientTCP").ToLocalChecked();
    auto tcp_client_template = v8::FunctionTemplate::New(isolate, new_tcp_client);
    tcp_client_template->SetClassName(name_tcp_client);
    tcp_client_template->InstanceTemplate()->SetInternalFieldCount(1);
    tcp_client_template->Inherit(base_template);

    NODE_SET_PROTOTYPE_METHOD(base_template, "getHostTo", get_host_to);
    NODE_SET_PROTOTYPE_METHOD(base_template, "getPortTo", get_port_to);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isClient", is_client);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isServer", is_server);
    NODE_SET_PROTOTYPE_METHOD(base_template, "receive", receive);
    NODE_SET_PROTOTYPE_METHOD(base_template, "send", send);

    // -- TCP Server --
    auto name_tcp_server = Nan::New("NetLinkSocketServerTCP").ToLocalChecked();
    auto tcp_server_template = v8::FunctionTemplate::New(isolate, new_tcp_server);
    tcp_server_template->SetClassName(name_tcp_server);
    tcp_server_template->InstanceTemplate()->SetInternalFieldCount(1);
    tcp_server_template->Inherit(base_template);

    NODE_SET_PROTOTYPE_METHOD(base_template, "accept", accept);
    NODE_SET_PROTOTYPE_METHOD(base_template, "getHostFrom", get_host_from);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isClient", is_client);
    NODE_SET_PROTOTYPE_METHOD(base_template, "isServer", is_server);

    // -- UDP --
    auto name_udp = Nan::New("NetLinkSocketUDP").ToLocalChecked();
    auto udp_template = v8::FunctionTemplate::New(isolate, new_udp);
    udp_template->SetClassName(name_udp);
    udp_template->InstanceTemplate()->SetInternalFieldCount(1);
    udp_template->Inherit(base_template);

    NODE_SET_PROTOTYPE_METHOD(base_template, "getHostFrom", get_host_from);
    NODE_SET_PROTOTYPE_METHOD(base_template, "getHostTo", get_host_to);
    NODE_SET_PROTOTYPE_METHOD(base_template, "getPortTo", get_port_to);
    NODE_SET_PROTOTYPE_METHOD(base_template, "receive", receive);
    NODE_SET_PROTOTYPE_METHOD(base_template, "receiveFrom", receive_from);
    NODE_SET_PROTOTYPE_METHOD(base_template, "setBlocking", set_blocking);
    NODE_SET_PROTOTYPE_METHOD(base_template, "send", send);
    NODE_SET_PROTOTYPE_METHOD(base_template, "sendTo", send_to);

    // Actually expose them to our module's exports
    Nan::Set(exports, name_base, Nan::GetFunction(base_template).ToLocalChecked());
    Nan::Set(exports, name_tcp_client, Nan::GetFunction(tcp_client_template).ToLocalChecked());
    Nan::Set(exports, name_tcp_server, Nan::GetFunction(tcp_server_template).ToLocalChecked());
    Nan::Set(exports, name_udp, Nan::GetFunction(udp_template).ToLocalChecked());

    class_socket_base.Reset(isolate, v8::Persistent<v8::FunctionTemplate>(isolate, base_template));
    class_socket_tcp_client.Reset(isolate, v8::Persistent<v8::FunctionTemplate>(isolate, tcp_client_template));
    class_socket_tcp_server.Reset(isolate, v8::Persistent<v8::FunctionTemplate>(isolate, tcp_server_template));
    class_socket_udp.Reset(isolate, v8::Persistent<v8::FunctionTemplate>(isolate, udp_template));
}

void NetLinkWrapper::new_base(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();
    isolate->ThrowException(v8::Exception::Error(Nan::New("NetLinkSocketBase should not be directly constructed").ToLocalChecked()));
}

void NetLinkWrapper::new_tcp_client(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();

    if (!args.IsConstructCall())
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New("NetLinkSocketClientTCP constructor must be invoked via 'new'.").ToLocalChecked()));
        return;
    }
    // else Invoked as constructor: `new NetLinkWrapper(...)`

    std::string host;
    std::uint16_t port = 0;
    NL::IPVer ip_version = NL::IPVer::IP4;

    if (ArgParser::Args(args)
            .arg("host", host)
            .arg("port", port)
            .opt("ipVersion", ip_version)
            .isInvalid())
    {
        return;
    }

    NL::Socket *socket;
    try
    {
        socket = new NL::Socket(host, port, NL::Protocol::TCP, ip_version);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    NetLinkWrapper *obj = new NetLinkWrapper(socket);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
}

void NetLinkWrapper::new_udp(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();

    if (!args.IsConstructCall())
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New("NetLinkSocketUDP constructor must be invoked via 'new'.").ToLocalChecked()));
        return;
    }
    // else Invoked as constructor: `new NetLinkWrapper(...)`

    // expected args, in order
    std::string host_to;
    std::uint16_t port_to = 0;
    std::string host_from;
    std::uint16_t port_from = 0;
    NL::IPVer ip_version = NL::IPVer::IP4;

    if (ArgParser::Args(args)
            .arg("hostTo", host_to)
            .arg("portTo", port_to)
            .opt("hostFrom", host_from)
            .opt("portFrom", port_from)
            .opt("ipVersion", ip_version)
            .isInvalid())
    {
        return;
    }

    NL::Socket *socket;
    try
    {
        if (port_from != 0 || host_from.length() > 0)
        {
            socket = new NL::Socket(host_to, port_to, host_from, port_from, ip_version);
        }
        else
        {
            socket = new NL::Socket(host_to, port_to, NL::Protocol::UDP, ip_version);
        }
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    NetLinkWrapper *obj = new NetLinkWrapper(socket);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
}

void NetLinkWrapper::new_tcp_server(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();

    if (!args.IsConstructCall())
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New("NetLinkSocketServerTCP constructor must be invoked via 'new'.").ToLocalChecked()));
        return;
    }

    std::uint16_t port_from = 0;
    std::string host_from;
    NL::IPVer ip_version = NL::IPVer::IP4;

    if (ArgParser::Args(args)
            .arg("portFrom", port_from)
            .opt("hostFrom", host_from)
            .opt("ipVersion", ip_version)
            .isInvalid())
    {
        return;
    }

    NL::Socket *socket;
    try
    {
        socket = new NL::Socket(port_from, NL::Protocol::TCP, ip_version, host_from);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    NetLinkWrapper *obj = new NetLinkWrapper(socket);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
}

void NetLinkWrapper::accept(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    // v8::HandleScope scope(isolate);

    NL::Socket *accepted = NULL;

    try
    {
        accepted = obj->socket->accept();
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    if (accepted != NULL)
    {
        auto new_wrapper = new NetLinkWrapper(accepted);
        // accept() only works on TCP servers,
        // So we know for certain wrapped instances always must be TCP clients
        auto function_template = NetLinkWrapper::class_socket_tcp_client.Get(isolate);
        auto object_template = function_template->InstanceTemplate();
        auto instance = Nan::NewInstance(object_template).ToLocalChecked();
        new_wrapper->Wrap(instance);

        args.GetReturnValue().Set(instance);
    }
}

void NetLinkWrapper::disconnect(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    // v8::HandleScope scope(isolate);

    size_t size = obj->socket->nextReadSize();
    if (size)
    {
        // we need to drain the socket. Otherwise it will hang on closing the
        // socket if there is still data in the buffer.
        auto buffer = std::vector<char>(size);
        obj->socket->read(buffer.data(), size);
    }

    try
    {
        obj->destroyed = true;
        obj->socket->disconnect();
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_host_from(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto hostFrom = obj->socket->hostFrom();
        args.GetReturnValue().Set(Nan::New(hostFrom).ToLocalChecked());
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_host_to(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto host_to = obj->socket->hostTo();
        args.GetReturnValue().Set(Nan::New(host_to).ToLocalChecked());
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_port_from(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto val = obj->socket->portFrom();
        auto v8_val = v8::Number::New(isolate, val);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_port_to(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto val = obj->socket->portTo();
        auto v8_val = v8::Number::New(isolate, val);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_blocking(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->blocking();
        auto v8_val = v8::Boolean::New(isolate, val);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_client(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->type();
        auto v8_val = v8::Boolean::New(isolate, val == NL::SocketType::CLIENT);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_destroyed(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto v8_bool = Nan::New(obj->destroyed);

    args.GetReturnValue().Set(v8_bool);
}

void NetLinkWrapper::is_ipv4(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->ipVer();
        auto v8_val = v8::Boolean::New(isolate, val == NL::IPVer::IP4);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_ipv6(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->ipVer();
        auto v8_val = v8::Boolean::New(isolate, val == NL::IPVer::IP6);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_server(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->type();
        auto v8_val = v8::Boolean::New(isolate, val == NL::SocketType::SERVER);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_tcp(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->protocol();
        auto v8_val = v8::Boolean::New(isolate, val == NL::Protocol::TCP);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::is_udp(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->protocol();
        auto v8_val = v8::Boolean::New(isolate, val == NL::Protocol::UDP);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::receive(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if (obj->socket->nextReadSize() < 1 && !obj->socket->blocking())
    {
        // we're not blocking and there is nothing to read, returning here
        // will return undefined to the js function, as there was nothing
        // to read.
        return;
    }

    std::stringstream ss;
    try
    {
        bool keep_reading = true;
        while (keep_reading)
        {
            auto buffer = std::array<char, READ_SIZE>();
            auto buffer_read = obj->socket->read(buffer.data(), READ_SIZE);
            if (buffer_read > 0)
            {
                ss << std::string(buffer.data(), buffer_read);
            }
            if (buffer_read != READ_SIZE)
            {
                keep_reading = false;
            }
        }
    }
    catch (NL::Exception &e)
    {
        auto isolate = v8::Isolate::GetCurrent();
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    auto str = ss.str();
    if (str.length()) // range check
    {
        args.GetReturnValue().Set(Nan::CopyBuffer(str.c_str(), str.length()).ToLocalChecked());
    }
    // else it did not read any data, so this will return undefined
}

void NetLinkWrapper::receive_from(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    std::stringstream read_ss;
    std::string host_from = "";
    unsigned int port_from = 0;
    try
    {
        bool keep_reading = true;
        while (keep_reading)
        {
            auto buffer = std::array<char, READ_SIZE>();
            auto buffer_read = obj->socket->readFrom(buffer.data(), READ_SIZE, &host_from, &port_from);
            if (buffer_read > 0)
            {
                read_ss << std::string(buffer.data(), buffer_read);
            }
            if (buffer_read != READ_SIZE)
            {
                keep_reading = false;
            }
        }
    }
    catch (NL::Exception &e)
    {
        auto isolate = v8::Isolate::GetCurrent();
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }

    auto read = read_ss.str();
    if (host_from.length() || port_from || read.length())
    {
        // args.GetReturnValue().Set(Nan::New(read.c_str()).ToLocalChecked());
        auto return_object = Nan::New<v8::Object>();

        auto host_key = Nan::New("host").ToLocalChecked();
        auto host_value = Nan::New(host_from).ToLocalChecked();
        Nan::Set(return_object, host_key, host_value);

        auto port_key = Nan::New("port").ToLocalChecked();
        auto port_value = Nan::New(port_from);
        Nan::Set(return_object, port_key, port_value);

        auto data_key = Nan::New("data").ToLocalChecked();
        auto data_value = Nan::CopyBuffer(read.c_str(), read.length()).ToLocalChecked();
        Nan::Set(return_object, data_key, data_value);

        args.GetReturnValue().Set(return_object);
    }
    // else it did not read any data, so this will return undefined
}

void NetLinkWrapper::set_blocking(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    bool blocking = true;
    if (ArgParser::Args(args)
            .arg("blocking", blocking)
            .isInvalid())
    {
        return;
    }

    try
    {
        auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
        obj->socket->blocking(blocking);
    }
    catch (NL::Exception &e)
    {
        auto isolate = v8::Isolate::GetCurrent();
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::send(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    std::string data;
    if (ArgParser::Args(args)
            .arg("data", data, ArgParser::SubType::SendableData)
            .isInvalid())
    {
        return;
    }

    try
    {
        auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
        obj->socket->send(data.c_str(), data.length());
    }
    catch (NL::Exception &e)
    {
        auto isolate = v8::Isolate::GetCurrent();
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::send_to(const v8::FunctionCallbackInfo<v8::Value> &args)
{

    std::string host;
    std::uint16_t port = 0;
    std::string data;
    if (ArgParser::Args(args)
            .arg("host", host)
            .arg("port", port)
            .arg("data", data, ArgParser::SubType::SendableData)
            .isInvalid())
    {
        return;
    }

    try
    {
        auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
        obj->socket->sendTo(data.c_str(), data.length(), host, port);
    }
    catch (NL::Exception &e)
    {
        auto isolate = v8::Isolate::GetCurrent();
        isolate->ThrowException(v8::Exception::Error(Nan::New(e.what()).ToLocalChecked()));
        return;
    }
}
