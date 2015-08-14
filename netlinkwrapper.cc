#include "netlinkwrapper.h"
#include <iostream>

using namespace v8;

Persistent<Function> NetLinkWrapper::constructor;

NetLinkWrapper::NetLinkWrapper()
{
}

NetLinkWrapper::~NetLinkWrapper()
{
    if (this->socket != nullptr)
    {
        delete this->socket;
    }
}

void NetLinkWrapper::Init(Handle<Object> exports)
{
    Isolate* isolate = Isolate::GetCurrent();

    // Prepare constructor template
    Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
    tpl->SetClassName(String::NewFromUtf8(isolate, "NetLinkWrapper"));
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    // Prototype
    NODE_SET_PROTOTYPE_METHOD(tpl, "connect", Connect);
    NODE_SET_PROTOTYPE_METHOD(tpl, "read", Read);
    NODE_SET_PROTOTYPE_METHOD(tpl, "send", Send);
    NODE_SET_PROTOTYPE_METHOD(tpl, "disconnect", Disconnect);

    constructor.Reset(isolate, tpl->GetFunction());
    exports->Set(String::NewFromUtf8(isolate, "NetLinkWrapper"), tpl->GetFunction());
}

void NetLinkWrapper::New(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    if (args.IsConstructCall())
    {
        // Invoked as constructor: `new NetLinkWrapper(...)`
        NetLinkWrapper* obj = new NetLinkWrapper();
        obj->Wrap(args.This());
        args.GetReturnValue().Set(args.This());
    }
    else
    {
        // Invoked as plain function `NetLinkWrapper(...)`, turn into construct call.
        const int argc = 1;
        Local<Value> argv[argc] = { args[0] };
        Local<Function> cons = Local<Function>::New(isolate, constructor);
        args.GetReturnValue().Set(cons->NewInstance(argc, argv));
    }
}

void NetLinkWrapper::Connect(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    v8::String::Utf8Value param1(args[0]->ToString());
    std::string server(*param1);
    int port = (int)args[1]->NumberValue();

    obj->socket = new NL::Socket(server, port);
}

void NetLinkWrapper::Read(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    size_t bufferSize = (int)args[0]->NumberValue();
    char* buffer = new char[bufferSize];
    int bufferRead = obj->socket->read(buffer, bufferSize);
    std::string read(buffer, bufferRead);

    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, read.c_str()));
    delete[] buffer;
}

void NetLinkWrapper::Send(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    v8::String::Utf8Value param1(args[0]->ToString());
    std::string writing(*param1);

    obj->socket->send(writing.c_str(), writing.length());
}

void NetLinkWrapper::Disconnect(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    obj->socket->disconnect();
}
