#include "Activity.h"

/**
 * @brief Activity class implementation
 */

Activity::Activity(const std::string& name, double unitEmission)
    : name_(name), unitEmission_(unitEmission) {}

double Activity::getEmission(double amount) const {
    return amount * unitEmission_;
}

std::string Activity::getName() const {
    return name_;
}

double Activity::getUnitEmission() const {
    return unitEmission_;
}