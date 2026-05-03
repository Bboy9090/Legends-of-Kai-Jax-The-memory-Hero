#pragma once
#include <string>
#include <vector>
#include <map>
#include <stdexcept>
#include <iostream>
#include <initializer_list>

namespace nlohmann {
    class json {
    public:
        enum class value_t { null, object, array, string, boolean, number_integer, number_unsigned, number_float };

        json() : _type(value_t::null) {}
        json(const char* s) : _type(value_t::string), _string(s) {}
        json(const std::string& s) : _type(value_t::string), _string(s) {}
        json(bool b) : _type(value_t::boolean), _bool(b) {}
        json(int i) : _type(value_t::number_integer), _int(i) {}
        json(float f) : _type(value_t::number_float), _float(f) {}

        template<typename T>
        T get() const;

        json& at(const std::string& key) { 
            _type = value_t::object;
            return _map[key]; 
        }

        const json& at(const std::string& key) const {
            auto it = _map.find(key);
            if (it == _map.end()) throw std::out_of_range(key);
            return it->second;
        }

        json& operator[](const std::string& key) { return at(key); }
        const json& operator[](const std::string& key) const { return at(key); }
        json& operator[](const char* key) { return at(key); }
        const json& operator[](const char* key) const { return at(key); }
        json& operator[](size_t index) { _type = value_t::array; if(index >= _array.size()) _array.resize(index+1); return _array[index]; }
        const json& operator[](size_t index) const { return _array.at(index); }
        json& operator[](int index) { return operator[](static_cast<size_t>(index)); }
        const json& operator[](int index) const { return operator[](static_cast<size_t>(index)); }

        bool contains(const std::string& key) const { return _map.find(key) != _map.end(); }
        template<typename T>
        T value(const std::string& key, T default_value) const {
            if (!contains(key)) return default_value;
            return at(key).get<T>();
        }

        // Standard iteration (returns json&)
        class iterator {
        public:
            enum class it_type { map, vec };
            it_type type;
            std::map<std::string, json>::iterator m_it;
            std::vector<json>::iterator v_it;

            bool operator!=(const iterator& other) const { 
                if (type != other.type) return true;
                return type == it_type::map ? m_it != other.m_it : v_it != other.v_it;
            }
            iterator& operator++() { if(type == it_type::map) ++m_it; else ++v_it; return *this; }
            json& operator*() { return type == it_type::map ? m_it->second : *v_it; }
            json* operator->() { return type == it_type::map ? &m_it->second : &(*v_it); }
            const std::string& key() const { return m_it->first; }
            json& value() { return type == it_type::map ? m_it->second : *v_it; }
        };

        // Items iteration (returns key/value pairs)
        class items_iterator {
        public:
            std::map<std::string, json>::iterator m_it;
            bool operator!=(const items_iterator& other) const { return m_it != other.m_it; }
            items_iterator& operator++() { ++m_it; return *this; }
            std::pair<const std::string, json>& operator*() { return *m_it; }
        };

        struct items_proxy {
            json& j;
            items_iterator begin() { items_iterator it; it.m_it = j._map.begin(); return it; }
            items_iterator end() { items_iterator it; it.m_it = j._map.end(); return it; }
        };
        items_proxy items() { return { *this }; }
        bool is_boolean() const { return _type == value_t::boolean; }
        bool is_string() const { return _type == value_t::string; }
        bool is_array() const { return _type == value_t::array; }
        bool is_object() const { return _type == value_t::object; }
        size_t size() const { return _type == value_t::array ? _array.size() : (_type == value_t::object ? _map.size() : 0); }

        iterator begin() { 
            iterator it; 
            if(_type == value_t::object) { it.type = iterator::it_type::map; it.m_it = _map.begin(); }
            else { it.type = iterator::it_type::vec; it.v_it = _array.begin(); }
            return it;
        }
        iterator end() { 
            iterator it; 
            if(_type == value_t::object) { it.type = iterator::it_type::map; it.m_it = _map.end(); }
            else { it.type = iterator::it_type::vec; it.v_it = _array.end(); }
            return it;
        }

        // Const iteration
        class const_iterator {
        public:
            enum class it_type { map, vec };
            it_type type;
            std::map<std::string, json>::const_iterator m_it;
            std::vector<json>::const_iterator v_it;

            bool operator!=(const const_iterator& other) const { 
                if (type != other.type) return true;
                return type == it_type::map ? m_it != other.m_it : v_it != other.v_it;
            }
            const_iterator& operator++() { if(type == it_type::map) ++m_it; else ++v_it; return *this; }
            const json& operator*() const { return type == it_type::map ? m_it->second : *v_it; }
            const json* operator->() const { return type == it_type::map ? &m_it->second : &(*v_it); }
            
            const std::string& key() const { return m_it->first; }
            const json& value() const { return type == it_type::map ? m_it->second : *v_it; }
        };

        const_iterator begin() const { 
            const_iterator it; 
            if(_type == value_t::object) { it.type = const_iterator::it_type::map; it.m_it = _map.begin(); }
            else { it.type = const_iterator::it_type::vec; it.v_it = _array.begin(); }
            return it;
        }
        const_iterator end() const { 
            const_iterator it; 
            if(_type == value_t::object) { it.type = const_iterator::it_type::map; it.m_it = _map.end(); }
            else { it.type = const_iterator::it_type::vec; it.v_it = _array.end(); }
            return it;
        }

        static json parse(std::istream& is) { return json(); }
        static json parse(const std::string& s) { return json(); }

        operator std::string() const { return _string; }
        explicit operator bool() const { return _bool; }
        explicit operator int() const { return _int; }
        explicit operator float() const { return _float; }

        friend std::istream& operator>>(std::istream& is, json& j) { return is; }
        
        // Comparisons
        bool operator==(const char* s) const { return _type == value_t::string && _string == s; }
        bool operator==(const std::string& s) const { return _type == value_t::string && _string == s; }

    private:
        value_t _type;
        std::map<std::string, json> _map;
        std::vector<json> _array;
        std::string _string;
        bool _bool = false;
        int _int = 0;
        float _float = 0.0f;
    };

    template<> inline std::string json::get<std::string>() const { return _string; }
    template<> inline int json::get<int>() const { return _int; }
    template<> inline float json::get<float>() const { return _float; }
    template<> inline bool json::get<bool>() const { return _bool; }
    template<> inline std::vector<std::string> json::get<std::vector<std::string>>() const { return {}; }

    // Implicit conversions
    inline void to_json(json& j, const std::string& s) { j = json(s); }
}
