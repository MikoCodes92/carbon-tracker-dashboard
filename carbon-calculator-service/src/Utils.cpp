#include "Utils.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <sys/stat.h>

#ifdef _WIN32
  #include <direct.h>
#endif

namespace Utils {
bool ensureDirectoryExists(const std::string& path) {
    if (path.empty()) return false;

#ifdef _WIN32
    _mkdir(path.c_str());  // just call it, ignore return
#else
    mode_t mode = 0755;
    mkdir(path.c_str(), mode);  // ignore return
#endif

    struct stat info;
    if (stat(path.c_str(), &info) != 0) return false;
    return (info.st_mode & S_IFDIR) != 0;
}

std::string currentTimestampISO() {
    using namespace std::chrono;
    auto now = system_clock::now();
    std::time_t t = system_clock::to_time_t(now);
    std::tm tm{};
#if defined(_WIN32) || defined(_WIN64)
    gmtime_s(&tm, &t);
#else
    gmtime_r(&t, &tm);
#endif
    std::ostringstream ss;
    ss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%SZ");
    return ss.str();
}

bool isNonNegativeNumber(double v) {
    return (v >= 0.0);
}

} // namespace Utils
