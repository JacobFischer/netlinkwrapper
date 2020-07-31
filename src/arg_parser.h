#ifndef ARG_PARSER_H
#define ARG_PARSER_H

#include <cstdint>
#include <iostream>
#include <nan.h>
#include <node.h>
#include <sstream>
#include "arg_parser.h"
#include "netlinkwrapper.h"

namespace ArgParser
{
    enum SubType
    {
        None,
        SendableData,
    };

    class Args
    {
    private:
        bool valid = true;
        int position = -1;
        bool optional = true;
        const v8::FunctionCallbackInfo<v8::Value> *v8_args;

        template <typename T>
        std::string get_value(
            T &&value,
            const v8::Local<v8::Value> &arg,
            SubType checking_for)
        {
            return "Cannot handle unknown type";
        }

        template <>
        std::string get_value(
            std::uint16_t &value,
            const v8::Local<v8::Value> &arg,
            SubType checking_for)
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
        std::string get_value(
            bool &value,
            const v8::Local<v8::Value> &arg,
            SubType checking_for)
        {
            if (!arg->IsBoolean())
            {
                return "must be a boolean.";
            }

            auto isolate = v8::Isolate::GetCurrent();
            auto boolean = arg->IsTrue();

            value = boolean;
            return "";
        }

        template <>
        std::string get_value(
            NL::IPVer &value,
            const v8::Local<v8::Value> &arg,
            SubType checking_for)
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
        std::string get_value(
            std::string &value,
            const v8::Local<v8::Value> &arg,
            SubType checking_for)
        {
            auto is_string = arg->IsString();
            if (checking_for != SubType::SendableData && !is_string)
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
        Args(const v8::FunctionCallbackInfo<v8::Value> &args)
        {
            this->v8_args = &args;
        }

        bool isInvalid()
        {
            return !this->valid;
        }

        template <typename T>
        Args &opt(
            const char *arg_name,
            T &&value,
            SubType sub_type = SubType::None)
        {
            this->optional = true;
            return this->arg(arg_name, value, sub_type);
        }

        template <typename T>
        Args &arg(
            const char *arg_name,
            T &&value,
            SubType sub_type = SubType::None)
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

            std::string error_message = this->get_value<T>(value, arg, sub_type);

            if (error_message.length() > 0)
            {
                this->invalidate(arg_name, error_message);
            }

            return *this;
        }
    };
}; // namespace ArgParser

#endif
