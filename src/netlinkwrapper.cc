#define NOMINMAX
#include <limits>
#include <nan.h>
#include <sstream>
#include "netlinkwrapper.h"
#include "netlink/exception.h"
#include <iostream>

v8::Persistent<v8::Function> NetLinkWrapper::constructor;
v8::Local<v8::FunctionTemplate> NetLinkWrapper::class_socket_base;
v8::Local<v8::FunctionTemplate> NetLinkWrapper::class_socket_client_tcp;
v8::Local<v8::FunctionTemplate> NetLinkWrapper::class_socket_client_udp;

NetLinkWrapper::NetLinkWrapper(NL::Socket *socket)
{
    this->socket = socket;
}

NetLinkWrapper::~NetLinkWrapper()
{
    if (this->socket != nullptr)
    {
        delete this->socket;
    }
}

void NetLinkWrapper::init(v8::Local<v8::Object> exports)
{
    auto isolate = v8::Isolate::GetCurrent();

    // https://stackoverflow.com/questions/28076382/v8-inherited-functiontemplate-not-getting-updates-to-the-parent-functiontemplate

    auto name_class_socket_base = Nan::New("NetLinkSocketBase").ToLocalChecked();
    class_socket_base = v8::FunctionTemplate::New(isolate, new_base);
    class_socket_base->SetClassName(name_class_socket_base);
    class_socket_base->InstanceTemplate()->SetInternalFieldCount(1);

    // Prototype
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "accept", accept);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "disconnect", disconnect);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getHostFrom", get_host_from);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getHostTo", get_host_to);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getListenQueue", get_listen_queue);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getNextReadSize", get_next_read_size);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getPortFrom", get_port_from);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getPortTo", get_port_to);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "getSocketHandler", get_socket_handler);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isBlocking", is_blocking);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isClient", is_client);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isIPv4", is_ipv4);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isIPv6", is_ipv6);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isServer", is_server);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isTCP", is_tcp);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "isUDP", is_udp);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "read", read);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "readFrom", read_from);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "setBlocking", set_blocking);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "write", write);
    NODE_SET_PROTOTYPE_METHOD(class_socket_base, "writeTo", write_to);

    auto name_class_socket_client_tcp = Nan::New("NetLinkSocketClientTCP").ToLocalChecked();
    class_socket_client_tcp = v8::FunctionTemplate::New(isolate, new_client_tcp);
    class_socket_client_tcp->SetClassName(name_class_socket_client_tcp);
    class_socket_client_tcp->InstanceTemplate()->SetInternalFieldCount(1);
    class_socket_client_tcp->Inherit(class_socket_base);

    auto name_class_socket_client_udp = Nan::New("NetLinkSocketClientUDP").ToLocalChecked();
    class_socket_client_udp = v8::FunctionTemplate::New(isolate, new_client_udp);
    class_socket_client_udp->SetClassName(name_class_socket_client_udp);
    class_socket_client_udp->InstanceTemplate()->SetInternalFieldCount(1);
    class_socket_client_udp->Inherit(class_socket_base);

    Nan::Set(exports, name_class_socket_base, Nan::GetFunction(class_socket_base).ToLocalChecked());
    Nan::Set(exports, name_class_socket_client_tcp, Nan::GetFunction(class_socket_client_tcp).ToLocalChecked());
    Nan::Set(exports, name_class_socket_client_udp, Nan::GetFunction(class_socket_client_udp).ToLocalChecked());
}

void NetLinkWrapper::new_base(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();
    isolate->ThrowException(v8::Exception::Error(Nan::New("NetLinkSocketBase should not be directly constructed").ToLocalChecked()));
}

void NetLinkWrapper::new_client_tcp(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();

    if (!args.IsConstructCall())
    {
        // Invoked as plain function `NetLinkWrapper(...)`, turn into construct call.
        const int argc = 1;
        v8::Local<v8::Value> argv[argc] = {args[0]};
        v8::Local<v8::Function> cons = v8::Local<v8::Function>::New(isolate, constructor);
        args.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
        return;
    }
    // else Invoked as constructor: `new NetLinkWrapper(...)`

    std::string host;
    unsigned int port;
    if (args.Length() >= 2)
    {
        auto arg_host = args[0];
        if (!arg_host->IsString())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientTCP' first argument must be a host string to connect to").ToLocalChecked()));
            return;
        }
        Nan::Utf8String host_utf8_string(arg_host);
        host = std::string(*host_utf8_string);

        auto arg_port = args[1];
        if (!arg_port->IsNumber())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientTCP' second argument must be a port number to connect to").ToLocalChecked()));
            return;
        }
        auto as_number = arg_port->NumberValue(isolate->GetCurrentContext()).FromJust();
        port = static_cast<int>(as_number);
    }
    else
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientTCP' requires 2 arguments to be constructed").ToLocalChecked()));
        return;
    }

    NL::Socket *socket;
    try
    {
        socket = new NL::Socket(host, port);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }

    NetLinkWrapper *obj = new NetLinkWrapper(socket);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
}

void NetLinkWrapper::new_client_udp(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto isolate = v8::Isolate::GetCurrent();

    if (!args.IsConstructCall())
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>("NetLinkSocketClientUDP constructor must be invoked via 'new'.").ToLocalChecked()));
        return;
    }
    // else Invoked as constructor: `new NetLinkWrapper(...)`

    std::string host_to;
    unsigned int port_to;
    unsigned int port_from = 0;
    NL::IPVer ipver = NL::IPVer::IP4;
    if (args.Length() >= 2)
    {
        auto arg_host_to = args[0];
        if (!arg_host_to->IsString())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientUDP' first argument must be a hostTo string").ToLocalChecked()));
            return;
        }
        Nan::Utf8String host_utf8_string(arg_host_to);
        host_to = std::string(*host_utf8_string);

        auto arg_port_to = args[1];
        if (!arg_port_to->IsNumber())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientUDP' second argument must be a portTo number").ToLocalChecked()));
            return;
        }
        auto as_number = arg_port_to->NumberValue(isolate->GetCurrentContext()).FromJust();
        port_to = static_cast<int>(as_number);
    }
    else
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientUDP' requires at least 2 arguments to be constructed").ToLocalChecked()));
        return;
    }

    v8::Local<v8::Value> *maybe_ip = NULL;
    if (args.Length() >= 3)
    {
        auto third_arg = args[2];
        if (third_arg->IsNumber())
        {
            auto as_number = third_arg->NumberValue(isolate->GetCurrentContext()).FromJust();
            port_from = static_cast<int>(as_number);
        }
        else if (third_arg->IsString())
        {
            maybe_ip = &third_arg;
        }
        else if (third_arg->IsNullOrUndefined())
        {
            // do nothing, they don't care about the port or IP, both are optional anyways
        }
        else
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientUDP' third argument must be a portFrom number").ToLocalChecked()));
            return;
        }
    }
    if (args.Length() >= 4)
    {
        auto fourth_arg = args[3];
        if (fourth_arg->IsNullOrUndefined())
        {
            if (!fourth_arg->IsString())
            {
                isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'new NetLinkSocketClientUDP' fourth argument must be a portFrom number").ToLocalChecked()));
                return;
            }
            maybe_ip = &fourth_arg;
        }
    }

    if (maybe_ip)
    {
        auto arg = *maybe_ip;
        Nan::Utf8String ip_str_utf8(arg);
        auto ip_str = std::string(*ip_str_utf8);
        if (ip_str.compare("IPv6") == 0)
        {
            ipver = NL::IPVer::IP6;
        }
        else if (ip_str.compare("IPv4") != 0)
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New("'new NetLinkSocketClientUDP' ipVersion argument must be either 'IPv4' or 'IPv6' when set.").ToLocalChecked()));
            return;
        }
        // else keep the default, which is "IPv4"
    }

    NL::Socket *socket;
    try
    {
        if (port_from != 0)
        {
            socket = new NL::Socket(host_to, port_to, port_from, ipver);
        }
        else
        {
            socket = new NL::Socket(host_to, port_to, NL::Protocol::UDP, ipver);
        }
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }

    NetLinkWrapper *obj = new NetLinkWrapper(socket);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
}

void NetLinkWrapper::accept(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();
    // v8::HandleScope scope(isolate);

    NL::Socket *accepted = NULL;
    try
    {
        accepted = socket->accept();
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }

    if (accepted != NULL)
    {
        /*
        NetLinkWrapper *new_wrapper = new NetLinkWrapper(accepted);
        // accept only works on TCP, so we know for certain wrapped instances
        // always must be TCP clients
        auto instance = NetLinkWrapper::class_socket_client_tcp->New(isolate);
        new_wrapper->Wrap(instance);
        args.GetReturnValue().Set(new_wrapper);
        */
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
        char *buffer = new char[size + 1];
        obj->socket->read(buffer, size);
        delete[] buffer;
    }

    try
    {
        obj->socket->disconnect();
        delete obj->socket;
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        args.GetReturnValue().Set(Nan::New<v8::String>(hostFrom).ToLocalChecked());
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        args.GetReturnValue().Set(Nan::New<v8::String>(host_to).ToLocalChecked());
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_listen_queue(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto val = obj->socket->listenQueue();
        auto v8_number = v8::Number::New(isolate, val);
        args.GetReturnValue().Set(v8_number);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_next_read_size(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();

    try
    {
        auto val = obj->socket->nextReadSize();
        auto v8_val = v8::Number::New(isolate, val);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::get_socket_handler(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    try
    {
        auto val = obj->socket->socketHandler();
        auto v8_val = v8::Number::New(isolate, val);
        args.GetReturnValue().Set(v8_val);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
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
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::read(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();

    size_t buffer_size = socket->nextReadSize();
    if (args.Length() > 0)
    {
        auto arg = args[0];
        if (!arg->IsNumber())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'read' first argument must be a number representing how many bytes to try to read").ToLocalChecked()));
            return;
        }
        auto as_number = arg->NumberValue(isolate->GetCurrentContext()).FromJust();
        if (as_number <= 0)
        {
            std::ostringstream ss;
            ss << "'read' buffer size must be a positive number (" << as_number << ").";
            isolate->ThrowException(v8::Exception::TypeError(Nan::New(ss.str()).ToLocalChecked()));
            return;
        }
        if (as_number >= std::numeric_limits<unsigned int>::max())
        {
            std::ostringstream ss;
            ss << "'read' buffer size too large (" << as_number << ").";
            isolate->ThrowException(v8::Exception::TypeError(Nan::New(ss.str()).ToLocalChecked()));
            return;
        }

        buffer_size = static_cast<size_t>(as_number);
    }

    bool read_entire_buffer = false;
    if (buffer_size <= 0)
    {
        if (!socket->blocking())
        {
            // we're not blocking and there is nothing to read, returning here
            // will return undefined to the js function, as there was nothing
            // to read.
            return;
        }

        read_entire_buffer = true;
        buffer_size = 1;
    }

    char *buffer = new char[buffer_size];
    int buffer_read = 0;
    try
    {
        // std::cout << "read size: " << buffer_size << " with " << socket->blocking() << "." << std::endl;
        buffer_read = socket->read(buffer, buffer_size);
        // std::cout << "read: " << buffer << "." << std::endl;
        if (read_entire_buffer)
        {
            auto next_buffer_size = socket->nextReadSize();
            if (next_buffer_size > 0)
            {
                // std::cout << "gotta read more of size: " << next_buffer_size << "." << std::endl;
                std::string entire_string(buffer, buffer_size);
                delete[] buffer;
                buffer_size = next_buffer_size;
                buffer = new char[buffer_size];
                buffer_read = socket->read(buffer, buffer_size);
                std::string remaining_string(buffer, buffer_read);
                delete[] buffer;
                entire_string += remaining_string;
                buffer_size = entire_string.length();
                buffer_read = buffer_size;
                buffer = new char[buffer_size];
                strcpy(buffer, entire_string.c_str());
                // std::cout << "read the whole dang thing: " << buffer << "." << std::endl;
            }
        }
    }
    catch (NL::Exception &e)
    {
        delete[] buffer;
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(std::string("lol wut: ") + e.what()).ToLocalChecked()));
        return;
    }

    if (buffer_read > -1 && buffer_read <= (int)buffer_size) // range check
    {
        std::string read(buffer, buffer_read);
        args.GetReturnValue().Set(Nan::CopyBuffer(read.c_str(), read.length()).ToLocalChecked());
    }
    // else it did not read any data, so this will return undefined

    delete[] buffer;
}

void NetLinkWrapper::read_from(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();

    size_t buffer_size = socket->nextReadSize();
    if (args.Length() > 0)
    {
        auto arg = args[0];
        if (!arg->IsNumber())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'readFrom' first argument must be a number representing how many bytes to try to read").ToLocalChecked()));
            return;
        }
        auto as_number = arg->NumberValue(isolate->GetCurrentContext()).FromJust();
        buffer_size = static_cast<int>(as_number);
    }

    char *buffer = new char[buffer_size];
    int buffer_read = 0;
    std::string host_from;
    unsigned int port_from;
    try
    {
        buffer_read = socket->readFrom(buffer, buffer_size, &host_from, &port_from);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
    std::string read(buffer, buffer_read);
    delete[] buffer;

    if (buffer_read > -1 && buffer_read <= (int)buffer_size) // range check
    {
        // args.GetReturnValue().Set(Nan::New<v8::String>(read.c_str()).ToLocalChecked());
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
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();

    if (args.Length() > 0)
    {
        auto arg = args[0];
        if (!arg->IsBoolean())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("first arg to 'setBlocking' when passed must be boolean to set blocking to").ToLocalChecked()));
            return;
        }

        bool blocking = arg->ToBoolean(isolate)->Value();

        try
        {
            socket->blocking(blocking);
        }
        catch (NL::Exception &e)
        {
            isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
            return;
        }
    }
    else
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>("invalid number of args sent to 'setBlocking'").ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::write(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();

    bool valid = args.Length() > 0;
    std::string writing;
    if (valid)
    {
        auto arg = args[0];
        if (arg->IsString() || arg->IsUint8Array())
        {
            Nan::Utf8String param1(arg);
            writing = std::string(*param1);
        }
        else if (node::Buffer::HasInstance(arg))
        {
            writing = std::string(node::Buffer::Data(arg), node::Buffer::Length(arg));
        }
        else
        {
            valid = false;
        }
    }

    if (!valid)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'send' first argument must be a string to send").ToLocalChecked()));
        return;
    }

    try
    {
        socket->send(writing.c_str(), writing.length());
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::write_to(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    auto socket = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder())->socket;
    auto isolate = v8::Isolate::GetCurrent();

    std::string writing;
    std::string host;
    unsigned int port = 0;
    // shape: writeTo(host: string, port: number, data: string | UInt8Array | Buffer)
    if (args.Length() >= 3)
    {
        auto arg_host = args[0];
        if (!arg_host->IsString())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'writeTo' first argument must be a host string to send to").ToLocalChecked()));
            return;
        }
        Nan::Utf8String host_utf8_string(arg_host);
        host = std::string(*host_utf8_string);

        auto arg_port = args[1];
        if (!arg_port->IsNumber())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'writeTo' second argument must be a port number to send to").ToLocalChecked()));
            return;
        }
        auto as_number = arg_port->NumberValue(isolate->GetCurrentContext()).FromJust();
        port = static_cast<int>(as_number);

        auto arg_data = args[2];
        if (arg_data->IsString() || arg_data->IsUint8Array())
        {
            Nan::Utf8String param1(arg_data);
            writing = std::string(*param1);
        }
        else if (node::Buffer::HasInstance(arg_data))
        {
            writing = std::string(node::Buffer::Data(arg_data), node::Buffer::Length(arg_data));
        }
        else
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'writeTo' third argument must be a data to send to").ToLocalChecked()));
            return;
        }
    }

    try
    {
        socket->sendTo(writing.c_str(), writing.length() + 1, host, port);
    }
    catch (NL::Exception &e)
    {
        isolate->ThrowException(v8::Exception::Error(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}
