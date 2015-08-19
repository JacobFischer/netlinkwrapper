#include "netlinkwrapper.h"
#include "netlink/exception.h"

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
    NODE_SET_PROTOTYPE_METHOD(tpl, "blocking", Blocking);
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

    if(args.Length() != 2)
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "'connect' requires two arguments")));
        return;
    }

    if(!args[0]->IsString())
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "'connect' first arg should be string for server")));
        return;
    }
    v8::String::Utf8Value param1(args[0]->ToString());
    std::string server(*param1);

    if(!args[1]->IsNumber())
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "'connect' second arg should be number for port on server")));
        return;
    }
    int port = (int)args[1]->NumberValue();

    try
    {
        obj->socket = new NL::Socket(server, port);
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
        return;
    }
}

void NetLinkWrapper::Blocking(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if(args.Length() == 0)
    {
        bool blocking = false;
        try
        {
            blocking = obj->socket->blocking();
        }
        catch(NL::Exception& e)
        {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
            return;
        }
        args.GetReturnValue().Set(Boolean::New(isolate, blocking));
    }
    else if(args.Length() == 1)
    {
        if(!args[0]->IsBoolean())
        {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "first optional arg when passed must be boolean to set blocking to")));
            return;
        }

        try
        {
            obj->socket->blocking(args[0]->BooleanValue());
        }
        catch(NL::Exception& e)
        {
            isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
            return;
        }
    }
    else
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "too many args sent to blocking")));
        return;
    }
}

#include <iostream>

void NetLinkWrapper::Read(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if(args.Length() != 1 || !args[0]->IsNumber())
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "'read' first argument must be a number representing how many bytes to try to read")));
        return;
    }
    size_t bufferSize = (int)args[0]->NumberValue();
    char* buffer = new char[bufferSize];

    int bufferRead = 0;
    try
    {
        bufferRead = obj->socket->read(buffer, bufferSize);
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
        return;
    }

    if(bufferRead > -1 && bufferRead <= bufferSize) // range check
    {
        std::string read(buffer, bufferRead);
        args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, read.c_str()));
    }
    //else it did not read any data, so this will return undefined

    delete[] buffer;
}

void NetLinkWrapper::Send(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if(args.Length() != 1 || !args[0]->IsString())
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "'send' first argument must be a string to send")));
        return;
    }
    v8::String::Utf8Value param1(args[0]->ToString());
    std::string writing(*param1);

    try
    {
        obj->socket->send(writing.c_str(), writing.length());
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
        return;
    }
}

void NetLinkWrapper::Disconnect(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = Isolate::GetCurrent();
    HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    try
    {
        obj->socket->disconnect();
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, e.what())));
        return;
    }
}
