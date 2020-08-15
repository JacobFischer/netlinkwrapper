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

    std::string get_typeof_str(const v8::Local<v8::Value> &arg)
    {
        auto isolate = v8::Isolate::GetCurrent();
        auto typeof = arg->TypeOf(isolate);

        Nan::Utf8String utf8_str(arg);
        std::stringstream ss;
        ss << "Got type \"" << *utf8_str << "\".";
        return ss.str();
    }

    template <typename T>
    std::string get_value(
        T &&value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        return "Cannot handle unknown type";
    }

    template <>
    std::string get_value(
        std::uint16_t &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        if (!arg->IsNumber())
        {
            return "must be a number. " + get_typeof_str(arg);
        }

        auto isolate = v8::Isolate::GetCurrent();
        auto as_number = arg->IntegerValue(isolate->GetCurrentContext()).FromJust();

        if (as_number <= 0)
        {
            std::stringstream ss;
            ss << as_number << " must be greater than 0.";
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
    std::string get_value(
        bool &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        if (!arg->IsBoolean())
        {
            return "must be a boolean. " + get_typeof_str(arg);
        }

        auto boolean = arg->IsTrue();
        value = boolean;
        return "";
    }

    template <>
    std::string get_value(
        NL::IPVer &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        std::string invalid_string("must be an ip version string either 'IPv4' or 'IPv6'.");
        if (!arg->IsString())
        {
            std::stringstream ss;
            ss << invalid_string << " " << get_typeof_str(arg);
            return ss.str();
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
    std::string get_value(
        std::string &value,
        const v8::Local<v8::Value> &arg,
        SubType sub_type)
    {
        auto is_string = arg->IsString();
        if (sub_type != SubType::SendableData && !is_string)
        {
            return "must be a string. " + get_typeof_str(arg);
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
