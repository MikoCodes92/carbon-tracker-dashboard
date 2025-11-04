#include "User.h"
#include "Utils.h"
#include <iomanip>
#include <iostream>
#include <fstream>

User::User() {}

void User::addActivity(const Activity& activity, double amount) {
    double emission = activity.getEmission(amount);
    records_.push_back({activity.getName(), amount, emission});
}

double User::calculateTotalEmission() const {
    double total = 0.0;
    for (const auto& r : records_) total += r.emission;
    return total;
}

void User::printReport() const {
    std::cout << "\nCarbon Footprint Report\n-----------------------\n";
    std::cout << std::fixed << std::setprecision(2);
    for (const auto& r : records_) {
        std::cout << r.name << " (amount: " << r.amount << "): " << r.emission << " kg CO2\n";
    }
    std::cout << "-----------------------\n";
    std::cout << "TOTAL: " << calculateTotalEmission() << " kg CO2 per day\n\n";

    std::cout << "Suggestions:\n";
    for (const auto& r : records_) {
        if (r.name == "Car" && r.amount > 0.0) {
            std::cout << "- Consider reducing car travel or carpooling; use public transit or bike.\n";
        } else if (r.name == "Electricity" && r.amount > 0.0) {
            std::cout << "- Reduce electricity: switch to LEDs, unplug idle devices.\n";
        } else if (r.name == "Meat Meals" && r.amount > 0.0) {
            std::cout << "- Reduce meat consumption; add vegetarian days.\n";
        } else if (r.name == "Bus" && r.amount > 0.0) {
            std::cout << "- Good: public transport reduces per-person emissions.\n";
        }
    }
    std::cout << "\n";
}

bool User::saveHistoryCSV(const std::string& filepath) const {
    size_t pos = filepath.find_last_of("/\\");
    if (pos != std::string::npos) {
        std::string dir = filepath.substr(0, pos);
        Utils::ensureDirectoryExists(dir);
    }

    std::ofstream out(filepath, std::ios::app);
    if (!out.is_open()) return false;

    double total = calculateTotalEmission();
    out << timestampISO() << "," << total << ",\"";
    bool first = true;
    for (const auto& r : records_) {
        if (!first) out << ";";
        out << r.name << ":" << r.amount << ":" << r.emission;
        first = false;
    }
    out << "\"\n";
    out.close();
    return true;
}

std::string User::timestampISO() const {
    return Utils::currentTimestampISO();
}

const std::vector<ActivityRecord>& User::getRecords() const {
    return records_;
}
