#include <node.h>
#include "netlinkwrapper.h"

void InitAll(v8::Local<v8::Object> exports)
{
    NetLinkWrapper::Init(exports);
}

NODE_MODULE(netlinksocket, InitAll)
