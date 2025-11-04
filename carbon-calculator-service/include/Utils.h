#pragma once
#include <string>

namespace Utils {
    bool ensureDirectoryExists(const std::string& path);
    std::string currentTimestampISO();
    // Basic input sanitizer: ensure non-negative numeric value
    bool isNonNegativeNumber(double v);
}
