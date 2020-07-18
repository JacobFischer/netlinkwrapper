#include <nan.h>
#include "netlinkwrapper.h"
#include "netlink/exception.h"

v8::Persistent<v8::Function> NetLinkWrapper::constructor;

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

void NetLinkWrapper::Init(v8::Local<v8::Object> exports)
{
    auto isolate = v8::Isolate::GetCurrent();

    // Prepare constructor template
    v8::Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, New);
    tpl->SetClassName(Nan::New<v8::String>("NetLinkWrapper").ToLocalChecked());
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    // Prototype
    NODE_SET_PROTOTYPE_METHOD(tpl, "connect", Connect);
    NODE_SET_PROTOTYPE_METHOD(tpl, "blocking", Blocking);
    NODE_SET_PROTOTYPE_METHOD(tpl, "read", Read);
    NODE_SET_PROTOTYPE_METHOD(tpl, "write", Write);
    NODE_SET_PROTOTYPE_METHOD(tpl, "disconnect", Disconnect);

    constructor.Reset(isolate, Nan::GetFunction(tpl).ToLocalChecked());
    Nan::Set(exports, Nan::New<v8::String>("NetLinkWrapper").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

void NetLinkWrapper::New(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

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
        v8::Local<v8::Value> argv[argc] = { args[0] };
        v8::Local<v8::Function> cons = v8::Local<v8::Function>::New(isolate, constructor);
        args.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
    }
}

void NetLinkWrapper::Connect(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if (args.Length() != 2 && args.Length() != 1)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'connect' requires the arguments port and optionally host").ToLocalChecked()));
        return;
    }

    if(!args[0]->IsNumber())
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'connect' second arg should be number for port on server").ToLocalChecked()));
        return;
    }
    int port = (int)args[0]->NumberValue(isolate->GetCurrentContext()).FromJust();

    std::string server = "127.0.0.1";
    if(args[1]->IsString())
    {
        Nan::Utf8String param1(args[1]);
        server = std::string(*param1);
    }

    try
    {
        obj->socket = new NL::Socket(server, port);
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::Blocking(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

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
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
            return;
        }
        args.GetReturnValue().Set(v8::Boolean::New(isolate, blocking));
    }
    else if(args.Length() == 1)
    {
        if(!args[0]->IsBoolean())
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("first optional arg when passed must be boolean to set blocking to").ToLocalChecked()));
            return;
        }

        try
        {
            bool blocking = false;
            auto localMaybeBlocking = Nan::To<v8::Boolean>(args[0]);
            if (!localMaybeBlocking.IsEmpty()) {
                auto blockingV8 = localMaybeBlocking.ToLocalChecked().As<v8::Boolean>();
                blocking = blockingV8->Value();
            }
            obj->socket->blocking(blocking);
        }
        catch(NL::Exception& e)
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
            return;
        }
    }
    else
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("too many args sent to blocking").ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::Read(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    if((args.Length() != 1 && args.Length() != 2) || !args[0]->IsNumber())
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'read' first argument must be a number representing how many bytes to try to read").ToLocalChecked()));
        return;
    }
    size_t bufferSize = (int)args[0]->NumberValue(isolate->GetCurrentContext()).FromJust();
    char* buffer = new char[bufferSize];

    if(args.Length() == 2 && args[0]->IsBoolean()) {
        try
        {
            bool blocking = false;
            auto localMaybeBlocking = Nan::To<v8::Boolean>(args[1]);
            if (!localMaybeBlocking.IsEmpty()) {
                auto blockingV8 = localMaybeBlocking.ToLocalChecked().As<v8::Boolean>();
                blocking = blockingV8->Value();
            }
            obj->socket->blocking(blocking);
        }
        catch(NL::Exception& e)
        {
            isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
            return;
        }
    }

    int bufferRead = 0;
    try
    {
        bufferRead = obj->socket->read(buffer, bufferSize);
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }

    if(bufferRead > -1 && bufferRead <= (int)bufferSize) // range check
    {
        args.GetReturnValue().Set(Nan::NewBuffer(buffer, bufferRead).ToLocalChecked());
    }
    // else it did not read any data, so this will return undefined

    delete[] buffer;
}

void NetLinkWrapper::Write(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    bool valid = args.Length() > 0;
    std::string writing;
    if(valid)
    {
        auto arg = args[0];
        if(arg->IsString() || arg->IsUint8Array()) {
            Nan::Utf8String param1(arg);
            writing = std::string(*param1);
        } else if (node::Buffer::HasInstance(arg)) {
            writing = std::string(node::Buffer::Data(arg), node::Buffer::Length(arg));
        } else {
            valid = false;   
        }
    }

    if (!valid) {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>("'send' first argument must be a string to send").ToLocalChecked()));
        return;
    }

    try
    {
        obj->socket->send(writing.c_str(), writing.length());
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}

void NetLinkWrapper::Disconnect(const v8::FunctionCallbackInfo<v8::Value>& args)
{
    auto isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);

    NetLinkWrapper* obj = ObjectWrap::Unwrap<NetLinkWrapper>(args.Holder());

    try
    {
        obj->socket->disconnect();
    }
    catch(NL::Exception& e)
    {
        isolate->ThrowException(v8::Exception::TypeError(Nan::New<v8::String>(e.what()).ToLocalChecked()));
        return;
    }
}
