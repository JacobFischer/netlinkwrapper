#ifndef GET_VALUE_H
#define GET_VALUE_H

#include <cstdint>
#include <iostream>
#include <nan.h>
#include <node.h>
#include <sstream>
#include "netlinkwrapper.h"

namespace GetValue
{
    enum SubType
    {
        None,
        SendableData,
    };

    template <typename T>
    std::string get_value(
        T &&value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        return "Cannot handle unknown type";
    }

    template <>
    static std::string get_value(
        std::uint16_t &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        if (!arg->IsNumber())
        {
            return "must be a number.";
        }

        auto isolate = v8::Isolate::GetCurrent();
        auto as_number = arg->IntegerValue(isolate->GetCurrentContext()).FromJust();

        if (as_number < 0)
        {
            std::stringstream ss;
            ss << "is negative, must be positive (" << as_number << ").";
            return ss.str();
        }

        if (as_number > UINT16_MAX)
        {
            std::stringstream ss;
            ss << as_number << " beyond max port range of "
               << UINT16_MAX << ".";
            return ss.str();
        }

        value = static_cast<std::uint16_t>(as_number);
        return "";
    }

    template <>
    static std::string get_value(
        bool &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        if (!arg->IsBoolean())
        {
            return "must be a boolean.";
        }

        auto boolean = arg->IsTrue();
        value = boolean;
        return "";
    }

    template <>
    static std::string get_value(
        NL::IPVer &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        std::string invalid_string("must be an ip version string either 'IPv4' or 'IPv6'.");
        if (!arg->IsString())
        {
            return invalid_string;
        }

        Nan::Utf8String utf8_string(arg);
        std::string str(*utf8_string);

        if (str.compare("IPv6") == 0)
        {
            value = NL::IPVer::IP6;
        }
        else if (str.compare("IPv4") == 0)
        {
            value = NL::IPVer::IP4;
        }
        else
        {
            std::stringstream ss;
            ss << invalid_string << " Got: '" << str << "'.";
            return ss.str();
        }

        return "";
    }

    template <>
    static std::string get_value(
        std::string &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        auto is_string = arg->IsString();
        if (sub_type != SubType::SendableData && !is_string)
        {
            return "must be a string";
        }

        if (is_string)
        {
            Nan::Utf8String utf8_str(arg);
            value = std::string(*utf8_str);
        }
        else if (arg->IsUint8Array())
        {
            auto typed_array = arg.As<v8::TypedArray>();
            Nan::TypedArrayContents<char> contents(typed_array);
            value = std::string(*contents, contents.length());
        }
        else if (node::Buffer::HasInstance(arg))
        {
            auto buffer = node::Buffer::Data(arg);
            auto length = node::Buffer::Length(arg);
            value = std::string(buffer, length);
        }
        else
        {
            return "must be a string, Buffer, or Uint8Array";
        }

        return "";
    }
} // namespace GetValue

#endif
