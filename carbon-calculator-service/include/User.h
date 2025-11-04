#pragma once
#include <vector>
#include <string>
#include <iostream>
#include <iomanip>
#include "Activity.h"
#include "Utils.h"

/**
 * @brief Represents a single activity record with calculated emissions
 */
struct ActivityRecord {
    std::string name;      ///< Activity name
    double amount;         ///< Quantity of activity
    double emission;       ///< Calculated emissions in kg CO2
};

/**
 * @brief Manages user activities and calculates carbon footprint
 * 
 * The User class:
 * - Tracks multiple activities
 * - Calculates total emissions
 * - Generates reports
 * - Saves history to CSV
 */
class User {
public:
    User();
    
    /**
     * @brief Adds an activity with specified amount
     * @param activity The activity to add
     * @param amount The quantity of the activity
     */
    void addActivity(const Activity& activity, double amount);
    
    /**
     * @brief Calculates total carbon emissions from all activities
     * @return Total emissions in kg CO2
     */
    double calculateTotalEmission() const;
    
    /**
     * @brief Prints a formatted carbon footprint report to console
     */
    void printReport() const;
    
    /**
     * @brief Saves activity history to CSV file
     * @param filepath Path to the CSV file
     * @return true if save was successful
     */
    bool saveHistoryCSV(const std::string& filepath) const;
    
    /**
     * @brief Gets all activity records
     * @return Constant reference to activity records vector
     */
    const std::vector<ActivityRecord>& getRecords() const;

private:
    /**
     * @brief Generates ISO timestamp for history
     * @return ISO 8601 formatted timestamp
     */
    std::string timestampISO() const;
    
    std::vector<ActivityRecord> records_;  ///< Collection of activity records
};