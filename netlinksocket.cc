#include <node.h>
#include "netlinkwrapper.h"

using namespace v8;

void InitAll(Handle<Object> exports)
{
    NetLinkWrapper::Init(exports);
}

NODE_MODULE(netlinksocket, InitAll)
