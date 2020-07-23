#include <node.h>
#include "netlinkwrapper.h"

void init_all(v8::Local<v8::Object> exports)
{
    NL::init();
    NetLinkWrapper::init(exports);
}

NODE_MODULE(netlinksocket, init_all)
