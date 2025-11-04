#pragma once
#include <string>
#include <fstream>

#ifdef _WIN32
  #include <windows.h>
#else
  #include <cstdlib> // setenv
#endif

namespace Utils {

inline void setEnvVar(const std::string &key, const std::string &val) {
#ifdef _WIN32
    SetEnvironmentVariableA(key.c_str(), val.c_str());
#else
    setenv(key.c_str(), val.c_str(), 1);
#endif
}

// Load a .env file with lines like: OPENAI_API_KEY="sk-xxxx"
inline void loadEnv(const std::string& filepath) {
    std::ifstream f(filepath);
    if (!f.is_open()) return;

    std::string line;
    while (std::getline(f, line)) {
        auto pos = line.find('=');
        if (pos == std::string::npos) continue;
        std::string key = line.substr(0, pos);
        std::string val = line.substr(pos + 1);

        // Remove quotes if present
        if (!val.empty() && val.front() == '"' && val.back() == '"')
            val = val.substr(1, val.size()-2);

        setEnvVar(key, val);
    }
}

} // namespace Utils
