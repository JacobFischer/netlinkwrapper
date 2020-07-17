#ifndef NETLINKOBJECT_H
#define NETLINKOBJECT_H

#include <node.h>
#include <node_object_wrap.h>
#include "netlink/socket.h"

class NetLinkWrapper : public node::ObjectWrap
{
    public:
        static void Init(v8::Local<v8::Object> exports);

    private:
        NL::Socket* socket;

        explicit NetLinkWrapper();
        ~NetLinkWrapper();

        static void New(const v8::FunctionCallbackInfo<v8::Value>& args);

        static void Connect(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Blocking(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Read(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Write(const v8::FunctionCallbackInfo<v8::Value>& args);
        static void Disconnect(const v8::FunctionCallbackInfo<v8::Value>& args);

        static v8::Persistent<v8::Function> constructor;
};

#endif
