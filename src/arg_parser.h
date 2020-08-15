#ifndef ARG_PARSER_H
#define ARG_PARSER_H

#include <cstdint>
#include <nan.h>
#include <node.h>
#include <sstream>
#include "netlinkwrapper.h"
#include "get_value.h"

class ArgParser
{
private:
    bool valid = true;
    int position = -1;
    bool optional = false;
    const v8::FunctionCallbackInfo<v8::Value> *v8_args;

    std::string named_position()
    {
        switch (this->position)
        {
        case 0:
            return "First";
        case 1:
            return "Second";
        case 2:
            return "Third";
        case 3:
            return "Fourth";
        case 4:
            return "Fifth";
        case 5:
            return "Sixth";
        case 6:
            return "Seventh";
        case 7:
            return "Eighth";
        case 8:
            return "Ninth";
        case 9:
            return "Tenth";
        // would there really be any more positional args past here?
        default:
            return "Some";
        }
    }

    void invalidate(const char *arg_name, std::string reason)
    {
        this->valid = false;

        auto isolate = v8::Isolate::GetCurrent();
        std::stringstream ss;

        ss << named_position();
        ss << " argument \"" << arg_name << "\" ";
        ss << reason;
        auto error = Nan::New(ss.str()).ToLocalChecked();
        isolate->ThrowException(v8::Exception::TypeError(error));
    }

public:
    ArgParser(const v8::FunctionCallbackInfo<v8::Value> &args)
    {
        this->v8_args = &args;
    }

    bool isInvalid()
    {
        return !this->valid;
    }

    template <typename T>
    ArgParser &opt(
        const char *arg_name,
        T &&value,
        GetValue::SubType sub_type = GetValue::SubType::None)
    {
        this->optional = true;
        return this->arg(arg_name, value, sub_type);
    }

    template <typename T>
    ArgParser &arg(
        const char *arg_name,
        T &&value,
        GetValue::SubType sub_type = GetValue::SubType::None)
    {
        this->position += 1;

        if (!this->valid)
        {
            return *this; // no reason to keep parsing
        }

        auto args_length = this->v8_args->Length();
        if (this->position >= args_length)
        {
            if (!this->optional)
            {
                std::stringstream ss;
                ss << "is required, but not enough arguments passed "
                   << "(" << args_length << ").";
                this->invalidate(arg_name, ss.str());
            }

            return *this;
        }

        auto arg = (*this->v8_args)[this->position];

        if (this->optional && arg->IsUndefined())
        {
            return *this;
        }

        std::string error_message = GetValue::get_value<T>(value, arg, sub_type);

        if (error_message.length() > 0)
        {
            this->invalidate(arg_name, error_message);
        }

        return *this;
    }
};

#endif
