#pragma once
#include <string>

/**
 * @brief Represents a carbon-emitting activity with its emission factor
 * 
 * Each activity has:
 * - A name (e.g., "Car", "Electricity")
 * - An emission factor (kg CO2 per unit)
 * - Methods to calculate emissions based on amount
 */
class Activity {
public:
    /**
     * @brief Constructs a new Activity object
     * @param name The name of the activity
     * @param unitEmission Emission factor (kg CO2 per unit)
     */
    Activity(const std::string& name = "", double unitEmission = 0.0);
    
    /**
     * @brief Calculates total emissions for a given amount
     * @param amount The quantity of the activity
     * @return Total emissions in kg CO2
     */
    double getEmission(double amount) const;
    
    /**
     * @brief Gets the activity name
     * @return Activity name
     */
    std::string getName() const;
    
    /**
     * @brief Gets the emission factor
     * @return Emission factor (kg CO2 per unit)
     */
    double getUnitEmission() const;

private:
    std::string name_;
    double unitEmission_;
};