// Define this BEFORE including httplib.h to enable SSL support
#define CPPHTTPLIB_THREAD_POOL_COUNT 8

#include "httplib.h"
#include "json.hpp"
#include "User.h"
#include "Activity.h"
#include "Utils.h"
#include <iostream>
#include <string>
#include <cstdlib>
#include <sstream>
#include <fstream>
#include <filesystem>
#include <cmath>
#include <vector>
#include <regex>
#include <algorithm>

namespace fs = std::filesystem;
using json = nlohmann::json;

// ---------- Helper: fetch single factor (supports optional data_version) ----------
bool fetch_real_factor(const std::string &activity_id,
                       const std::string &data_version,
                       const json &parameters,
                       double &factor_out,
                       std::string &err) {
    const char* api_key = std::getenv("CLIMATIQ_API_KEY");
    if (!api_key || strlen(api_key) == 0) {
        err = "CLIMATIQ_API_KEY not set, using default factor for " + activity_id;
        return false;
    }

#ifdef CPPHTTPLIB_OPENSSL_SUPPORT
    httplib::SSLClient cli("api.climatiq.io", 443);
#else
    err = "SSL support not available. Cannot fetch real factors.";
    return false;
#endif

    cli.set_connection_timeout(10);
    cli.set_read_timeout(20);

    httplib::Headers headers = {
        {"Authorization", std::string("Bearer ") + api_key},
        {"Content-Type", "application/json"},
        {"Accept", "application/json"}
    };

    json body;
    body["emission_factor"] = { {"activity_id", activity_id} };
    if (!data_version.empty()) body["emission_factor"]["data_version"] = data_version;
    body["parameters"] = parameters;

    auto res = cli.Post("/data/v1/estimate", headers, body.dump(), "application/json");
    if (!res) {
        err = "Failed to fetch factor for " + activity_id;
        return false;
    }

    if (res->status != 200) {
        try {
            auto j = json::parse(res->body);
            if (j.contains("error") && j["error"].contains("message")) {
                err = "API returned status " + std::to_string(res->status) + ": " + j["error"]["message"].get<std::string>();
            } else if (j.contains("message")) {
                err = "API returned status " + std::to_string(res->status) + ": " + j["message"].get<std::string>();
            } else {
                err = "API returned status " + std::to_string(res->status) + ": " + res->body;
            }
        } catch (...) {
            err = "API returned status " + std::to_string(res->status) + ": " + res->body;
        }
        return false;
    }

    try {
        auto j = json::parse(res->body);
        if (j.contains("co2e")) {
            factor_out = j["co2e"].get<double>();
            return true;
        } else {
            err = "No co2e value returned for " + activity_id;
            return false;
        }
    } catch (...) {
        err = "Failed to parse JSON response for " + activity_id;
        return false;
    }
}

// ---------- New helper: batch fetch with per-item retry using suggested data_version ----------
/*
  requests: array of objects each with keys:
    - "activity_id" (string)
    - "parameters" (json object) -- **these should be the per-unit parameters (1 unit)**
    - "default" (double default factor to use if everything fails)
  Outputs:
    - out_factors sized as requests with either fetched factor (per-unit) or default
    - out_warnings: list of warning strings
    - out_raw_batch: parsed batch response JSON (if any)
  Returns true if the batch endpoint was called (regardless of individual item success).
  Returns false if we couldn't call the batch endpoint at all (e.g., no API key or no SSL).
*/
bool fetch_per_unit_factors(const std::vector<json> &requests,
                            std::vector<double> &out_factors,
                            std::vector<std::string> &out_warnings,
                            json &out_raw_batch) {
    out_factors.clear();
    out_warnings.clear();
    out_raw_batch = json::object();
    out_factors.resize(requests.size());

    const char* api_key = std::getenv("CLIMATIQ_API_KEY");
    if (!api_key || strlen(api_key) == 0) {
        out_warnings.push_back("CLIMATIQ_API_KEY not set; using default factors.");
        for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);
        return false;
    }

#ifdef CPPHTTPLIB_OPENSSL_SUPPORT
    httplib::SSLClient cli("api.climatiq.io", 443);
#else
    out_warnings.push_back("SSL support not available; using default factors.");
    for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);
    return false;
#endif

    cli.set_connection_timeout(10);
    cli.set_read_timeout(20);

    httplib::Headers headers = {
        {"Authorization", std::string("Bearer ") + api_key},
        {"Content-Type", "application/json"},
        {"Accept", "application/json"}
    };

    // Use a conservative starting data_version that's recent
    const std::string initial_data_version = "^27";

    // Build batch request (we send per-unit requests: amount=1)
    json batch_req = json::array();
    for (const auto &r : requests) {
        json elem;
        elem["emission_factor"] = { {"activity_id", r["activity_id"]}, {"data_version", initial_data_version} };
        elem["parameters"] = r.value("parameters", json::object()); // these parameters should be per-unit (1)
        batch_req.push_back(elem);
    }

    // Post batch
    auto res = cli.Post("/data/v1/estimate/batch", headers, batch_req.dump(), "application/json");
    if (!res) {
        out_warnings.push_back("Failed to call Climatiq batch endpoint; using defaults.");
        for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);
        return false;
    }

    // Debug logging
    std::cout << "DEBUG: Climatiq batch response status: " << res->status << std::endl;
    std::cout << "DEBUG: Climatiq batch response body:\n" << res->body << std::endl;

    // Parse response body for returning to caller
    json parsed;
    try {
        parsed = json::parse(res->body);
        out_raw_batch = parsed;
    } catch (...) {
        // keep empty out_raw_batch on parse fail
    }

    if (res->status != 200) {
        out_warnings.push_back(std::string("Climatiq batch returned HTTP ") + std::to_string(res->status) + "; using defaults.");
        for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);
        return true; // batch was called but returned non-200
    }

    // Ensure results array present
    if (!parsed.contains("results") || !parsed["results"].is_array()) {
        out_warnings.push_back("Climatiq batch response missing results array; using defaults.");
        for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);
        return true;
    }

    // Fill defaults first
    for (size_t i = 0; i < requests.size(); ++i) out_factors[i] = requests[i].value("default", 0.0);

    // Regex to extract suggested data_version from message (common pattern used in docs)
    std::regex version_rx(R"(latest 'data_version' is '([^']+)')", std::regex::icase);

    for (size_t i = 0; i < parsed["results"].size() && i < requests.size(); ++i) {
        auto &ri = parsed["results"][i];
        if (ri.contains("co2e")) {
            try {
                // Because we requested 1 unit, the returned co2e is the per-unit factor
                out_factors[i] = ri["co2e"].get<double>();
            } catch (...) {
                std::string m = "WARNING: failed to read co2e for batch item " + std::to_string(i) + "; using default";
                out_warnings.push_back(m);
                std::cout << m << std::endl;
            }
        } else if (ri.contains("error") || ri.contains("message")) {
            std::string message;
            try {
                if (ri.contains("message")) message = ri["message"].get<std::string>();
                else if (ri.contains("error")) message = ri["error"].get<std::string>();
                else message = "Unknown error";
            } catch (...) {
                message = "Unknown error parsing error object";
            }
            std::string warn = std::string("Climatiq batch item ") + std::to_string(i) + " error: " + message;
            out_warnings.push_back("WARNING: " + warn);
            std::cout << "WARNING: " << warn << std::endl;

            // Try to extract suggested data_version and retry that specific item
            std::smatch m;
            if (std::regex_search(message, m, version_rx) && m.size() >= 2) {
                std::string suggested = m[1].str();
                std::cout << "DEBUG: Found suggested data_version for item " << i << ": " << suggested << std::endl;
                double f;
                std::string single_err;
                if (fetch_real_factor(requests[i]["activity_id"].get<std::string>(),
                                      suggested,
                                      requests[i].value("parameters", json::object()),
                                      f,
                                      single_err)) {
                    out_factors[i] = f;
                    // annotate parsed results to show retry success
                    if (out_raw_batch.contains("results") && out_raw_batch["results"].size() > i) {
                        out_raw_batch["results"][i]["retried_with"] = suggested;
                        out_raw_batch["results"][i]["retried_co2e"] = f;
                    }
                    std::cout << "DEBUG: Retry successful for item " << i << " with data_version " << suggested << ", co2e=" << f << std::endl;
                } else {
                    std::string rwarn = "Retry with suggested data_version failed for item " + std::to_string(i) + ": " + single_err;
                    out_warnings.push_back(rwarn);
                    std::cout << "WARNING: " << rwarn << std::endl;
                    if (out_raw_batch.contains("results") && out_raw_batch["results"].size() > i) {
                        out_raw_batch["results"][i]["retry_error"] = single_err;
                    }
                }
            } else {
                std::string nomsg = "No suggested data_version found in batch error message for item " + std::to_string(i);
                out_warnings.push_back("WARNING: " + nomsg);
                std::cout << "WARNING: " << nomsg << std::endl;
            }
        } else {
            std::string nomsg = "Climatiq batch item " + std::to_string(i) + " returned unexpected result; using default.";
            out_warnings.push_back("WARNING: " + nomsg);
            std::cout << "WARNING: " << nomsg << std::endl;
        }
    }

    return true;
}

// ---------- load_dotenv ----------
void load_dotenv(const fs::path &env_file) {
    if (!fs::exists(env_file)) return;
    std::ifstream f(env_file);
    std::string line;
    while (std::getline(f, line)) {
        if (line.empty() || line[0] == '#') continue;
        auto eq = line.find('=');
        if (eq == std::string::npos) continue;
        std::string key = line.substr(0, eq);
        std::string value = line.substr(eq + 1);
#ifdef _WIN32
        _putenv_s(key.c_str(), value.c_str());
#else
        setenv(key.c_str(), value.c_str(), 1);
#endif
    }
}

// OpenAPI specification (unchanged)
static const char* OPENAPI_JSON = R"json({
  "openapi": "3.0.1",
  "info": {
    "title": "Carbon Footprint Analyzer API",
    "version": "1.0",
    "description": "Calculate personal CO2 footprint and optionally get AI explanations."
  },
  "paths": {
    "/calculate": {
      "post": {
        "summary": "Calculate footprint",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "car_km": { "type": "number" },
                  "bus_km": { "type": "number" },
                  "electricity_kwh": { "type": "number" },
                  "meat_meals": { "type": "number" },
                  "veg_meals": { "type": "number" }
                },
                "required": ["car_km","bus_km","electricity_kwh","meat_meals","veg_meals"]
              }
            }
          }
        },
        "responses": { "200": { "description": "Calculation result", "content": { "application/json": {} } } }
      }
    },
    "/explain": {
      "post": {
        "summary": "AI explanation (requires OPENAI_API_KEY)",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object" } } }
        },
        "responses": { "200": { "description": "AI explanation", "content": { "application/json" : {} } } }
      }
    }
  }
})json";

// Helper function to extract and validate numbers
static bool extract_nonneg_double(const json& j, const std::string& key, double &out) {
    try {
        if (!j.contains(key)) return false;
        out = j.value(key, 0.0);
        if (!Utils::isNonNegativeNumber(out)) return false;
    } catch (...) { return false; }
    return true;
}

// Sanitize payload to prevent OpenAI API errors
static void sanitize_payload(json &payload) {
    if (!payload.contains("breakdown")) return;
    for (auto &entry : payload["breakdown"]) {
        if (entry.contains("amount")) {
            double a = entry["amount"].get<double>();
            entry["amount"] = std::round(std::min(a, 10000.0) * 100.0) / 100.0;
        }
        if (entry.contains("emission")) {
            double e = entry["emission"].get<double>();
            entry["emission"] = std::round(std::min(e, 10000.0) * 100.0) / 100.0;
        }
    }
    if (payload.contains("total_emission")) {
        double t = payload["total_emission"].get<double>();
        payload["total_emission"] = std::round(std::min(t, 100000.0) * 100.0) / 100.0;
    }
}

// OpenAI call function (unchanged)
static bool call_openai_explain(const json &payload, json &out_response, std::string &err) {
    const char* api_key = std::getenv("OPENAI_API_KEY");
    if (!api_key || strlen(api_key) == 0) {
        err = "OPENAI_API_KEY not set in environment";
        return false;
    }

    if (!payload.contains("breakdown") || !payload["breakdown"].is_array()) {
        err = "Payload missing breakdown array";
        return false;
    }

    bool has_nonzero = false;
    for (const auto &e : payload["breakdown"]) {
        if (e.contains("emission") && e["emission"].get<double>() > 0.0) {
            has_nonzero = true;
            break;
        }
    }
    if (!has_nonzero && (payload.value("total_emission", 0.0) == 0.0)) {
        out_response = json::object();
        out_response["assistant_text"] = R"({"summary":"No measurable emissions detected","suggestions":["Keep maintaining low-emission habits","Verify input values if this seems incorrect"]})";
        out_response["raw_openai"] = json::object();
        return true;
    }

    std::ostringstream prompt;
    prompt << "Analyze this carbon footprint data:\n\n";
    for (const auto &entry : payload["breakdown"]) {
        std::string name = entry.value("name", std::string("Unknown"));
        double amount = entry.value("amount", 0.0);
        double emission = entry.value("emission", 0.0);
        if (amount < 0) amount = 0;
        if (emission < 0) emission = 0;
        prompt << "- " << name << ": " << amount << " units, " << emission << " kg CO2\n";
    }
    prompt << "Total: " << payload.value("total_emission", 0.0) << " kg CO2\n\n";
    prompt << "Provide a brief summary and 2-3 specific reduction suggestions in JSON format: {\"summary\": \"text\", \"suggestions\": [\"suggestion1\", \"suggestion2\"]}";

    std::string user_content = prompt.str();

    const size_t MAX_PROMPT_CHARS = 3000;
    if (user_content.size() > MAX_PROMPT_CHARS) {
        user_content = user_content.substr(0, MAX_PROMPT_CHARS) + "... (truncated)";
    }

    json body;
    body["model"] = "gpt-3.5-turbo";
    body["messages"] = json::array();
    body["messages"].push_back({ {"role", "system"}, {"content", "You are an environmental analyst. Provide clear, actionable carbon reduction advice in valid JSON format."} });
    body["messages"].push_back({ {"role", "user"}, {"content", user_content} });
    body["max_tokens"] = 500;
    body["temperature"] = 0.3;

    std::string body_str;
    try {
        body_str = body.dump();
    } catch (const std::exception &e) {
        err = std::string("Failed to serialize JSON: ") + e.what();
        return false;
    }

#ifdef CPPHTTPLIB_OPENSSL_SUPPORT
    httplib::SSLClient cli("api.openai.com", 443);
#else
    err = "SSL support not compiled in httplib. Define CPPHTTPLIB_OPENSSL_SUPPORT and link OpenSSL.";
    return false;
#endif

    cli.set_connection_timeout(30);
    cli.set_read_timeout(60);

    httplib::Headers headers = {
        {"Content-Type", "application/json"},
        {"Authorization", std::string("Bearer ") + api_key},
        {"Accept", "application/json"}
    };

    std::cout << "DEBUG: OpenAI Request JSON: " << body_str << std::endl;

    auto res = cli.Post("/v1/chat/completions", headers, body_str, "application/json");
    if (!res) {
        err = "Failed to call OpenAI API (no response or connection failed).";
        return false;
    }

    std::cout << "DEBUG: Response status: " << res->status << std::endl;
    std::cout << "DEBUG: Response body: " << res->body << std::endl;

    if (res->status != 200) {
        try {
            auto j = json::parse(res->body);
            if (j.contains("error") && j["error"].contains("message")) {
                err = std::string("OpenAI API returned status ") + std::to_string(res->status) + " - " + j["error"]["message"].get<std::string>();
            } else {
                err = std::string("OpenAI API returned status ") + std::to_string(res->status) + " - " + res->body;
            }
        } catch (...) {
            err = std::string("OpenAI API returned status ") + std::to_string(res->status) + " - " + res->body;
        }
        return false;
    }

    try {
        json j = json::parse(res->body);
        if (j.contains("choices") && j["choices"].is_array() && !j["choices"].empty()) {
            auto &choice = j["choices"][0];
            std::string assistant_text;
            if (choice.contains("message") && choice["message"].contains("content")) {
                assistant_text = choice["message"]["content"].get<std::string>();
            } else if (choice.contains("text")) {
                assistant_text = choice["text"].get<std::string>();
            } else {
                assistant_text = "";
            }

            out_response = json::object();
            out_response["raw_openai"] = j;
            out_response["assistant_text"] = assistant_text;
            return true;
        } else {
            err = "OpenAI response missing 'choices' or empty choices array";
            return false;
        }
    } catch (const std::exception &e) {
        err = std::string("Failed to parse OpenAI response: ") + e.what();
        return false;
    }
}

// Helper: parse or build AI parsed JSON (unchanged)
static json parse_or_build_ai_parsed(const std::string &assistant_text, const json &payload) {
    try {
        if (!assistant_text.empty()) {
            json parsed = json::parse(assistant_text);
            if (parsed.is_object() && (parsed.contains("summary") || parsed.contains("suggestions"))) {
                return parsed;
            }
        }
    } catch (...) {}

    json parsed;
    parsed["summary"] = assistant_text.empty() ? ("Estimated total emissions: " + std::to_string(payload.value("total_emission", 0.0)) + " kg CO2.") : assistant_text;
    parsed["suggestions"] = json::array();

    if (payload.contains("breakdown") && payload["breakdown"].is_array()) {
        std::vector<std::pair<double, std::string>> items;
        for (const auto &b : payload["breakdown"]) {
            std::string name = b.value("name", std::string("Unknown"));
            double emission = b.value("emission", 0.0);
            items.emplace_back(emission, name);
        }
        std::sort(items.begin(), items.end(), [](auto &a, auto &b){ return a.first > b.first; });
        int added = 0;
        for (auto &p : items) {
            if (added >= 3) break;
            double e = p.first;
            std::string name = p.second;
            if (e <= 0.0) continue;
            if (name.find("Car") != std::string::npos || name.find("car") != std::string::npos) {
                parsed["suggestions"].push_back("Reduce car usage: try carpooling, shorter trips, or switch to public transport when possible.");
            } else if (name.find("Meat") != std::string::npos) {
                parsed["suggestions"].push_back("Reduce high-emission meals: replace some meat meals with plant-based options.");
            } else if (name.find("Vegetarian") != std::string::npos) {
                parsed["suggestions"].push_back("Optimize food choices: source local produce and reduce food waste.");
            } else if (name.find("Electricity") != std::string::npos) {
                parsed["suggestions"].push_back("Lower home electricity use: use LED bulbs, efficient appliances, and unplug idle devices.");
            } else {
                parsed["suggestions"].push_back(std::string("Reduce usage in ") + name + " where possible to lower emissions.");
            }
            added++;
        }
    }

    if (parsed["suggestions"].empty()) {
        parsed["suggestions"].push_back("Your emissions are very low — continue low-impact habits and verify inputs.");
        parsed["suggestions"].push_back("Check appliances and travel habits for further reductions.");
    }

    return parsed;
}

// Calculate endpoint handler (updated to request per-unit factors via batch and then multiply by actual user amounts)
static void handle_calculate(const httplib::Request &req, httplib::Response &res) {
    json j;
    try {
        j = json::parse(req.body);
    } catch (...) {
        res.status = 400;
        res.set_content("{\"error\":\"Invalid JSON\"}", "application/json");
        return;
    }

    double car_km, bus_km, electricity_kwh, meat_meals, veg_meals;
    if (!extract_nonneg_double(j, "car_km", car_km) ||
        !extract_nonneg_double(j, "bus_km", bus_km) ||
        !extract_nonneg_double(j, "electricity_kwh", electricity_kwh) ||
        !extract_nonneg_double(j, "meat_meals", meat_meals) ||
        !extract_nonneg_double(j, "veg_meals", veg_meals))
    {
        res.status = 400;
        res.set_content("{\"error\":\"All fields must be non-negative numbers\"}", "application/json");
        return;
    }

    // Validate ranges
    if (car_km > 10000 || bus_km > 10000 || electricity_kwh > 10000 || meat_meals > 1000 || veg_meals > 1000) {
        res.status = 400;
        res.set_content("{\"error\":\"Input values too large\"}", "application/json");
        return;
    }

    // Build per-unit requests (we ask Climatiq for the CO2 for 1 unit)
    // Provide additional selector-like parameters to increase matching probability.
    std::vector<json> requests;

    // Car: include vehicle_type and common fuel selector placeholders (if API uses selectors it can match better)
    requests.push_back({
        {"activity_id", "passenger_vehicle-vehicle_type_car"},
        {"parameters", {
            {"distance", 1.0},
            {"distance_unit", "km"},
            {"vehicle_type", "car"},
            {"vehicle_occupancy", 1}
        }},
        {"default", 0.271}
    });

    // Bus
    requests.push_back({
        {"activity_id", "passenger_vehicle-vehicle_type_bus"},
        {"parameters", {
            {"distance", 1.0},
            {"distance_unit", "km"},
            {"vehicle_type", "bus"},
            {"vehicle_occupancy", 20} // typical passenger count approximation
        }},
        {"default", 0.105}
    });

    // Electricity: request per kWh (1 kWh)
    requests.push_back({
        {"activity_id", "electricity-supply_grid-source_residual_mix"},
        {"parameters", {
            {"energy", 1.0},
            {"energy_unit", "kWh"},
            // include optional region hint if you have one, e.g. "region": "GB-ENG"
        }},
        {"default", 0.475}
    });

    // Food: meat (per kg). Many food factors expect "mass" or "weight" and a unit; use weight/weight_unit
    requests.push_back({
        {"activity_id", "food-item_meat"},
        {"parameters", {
            {"weight", 1.0},
            {"weight_unit", "kg"},
            {"food_item", "meat"}
        }},
        {"default", 7.0}
    });

    // Vegetarian / plant-based
    requests.push_back({
        {"activity_id", "food-item_vegetarian"},
        {"parameters", {
            {"weight", 1.0},
            {"weight_unit", "kg"},
            {"food_item", "vegetarian"}
        }},
        {"default", 3.0}
    });

    // Fetch per-unit factors
    std::vector<double> per_unit_factors;
    std::vector<std::string> warnings;
    json raw_batch;
    bool batch_called = fetch_per_unit_factors(requests, per_unit_factors, warnings, raw_batch);

    // Decide final factors: per_unit_factors are per unit; they will multiply the amounts when creating Activities.
    double car_factor_per_unit = per_unit_factors.size() > 0 ? per_unit_factors[0] : 0.271;
    double bus_factor_per_unit = per_unit_factors.size() > 1 ? per_unit_factors[1] : 0.105;
    double electricity_factor_per_unit = per_unit_factors.size() > 2 ? per_unit_factors[2] : 0.475;
    double meat_factor_per_unit = per_unit_factors.size() > 3 ? per_unit_factors[3] : 7.0;
    double veg_factor_per_unit = per_unit_factors.size() > 4 ? per_unit_factors[4] : 3.0;

    if (!batch_called) {
        std::cout << "WARNING: Climatiq batch call failed; using default factors where necessary." << std::endl;
    }
    for (auto &w : warnings) std::cout << w << std::endl;

    // Log used per-unit factors
    std::cout << "DEBUG: Per-unit emission factors used:\n"
              << "  Car (kg CO2 per km): " << car_factor_per_unit << "\n"
              << "  Bus (kg CO2 per km): " << bus_factor_per_unit << "\n"
              << "  Electricity (kg CO2 per kWh): " << electricity_factor_per_unit << "\n"
              << "  Meat (kg CO2 per kg): " << meat_factor_per_unit << "\n"
              << "  Vegetarian (kg CO2 per kg): " << veg_factor_per_unit << "\n";

    // Create activities with per-unit factors and user amounts
    Activity car("Car", car_factor_per_unit);
    Activity bus("Bus", bus_factor_per_unit);
    Activity electricity("Electricity", electricity_factor_per_unit);
    Activity meatMeals("Meat Meals", meat_factor_per_unit);
    Activity vegMeals("Vegetarian Meals", veg_factor_per_unit);

    User user;
    user.addActivity(car, car_km);
    user.addActivity(bus, bus_km);
    user.addActivity(electricity, electricity_kwh);
    user.addActivity(meatMeals, meat_meals);
    user.addActivity(vegMeals, veg_meals);

    double total_emission = user.calculateTotalEmission();
    json breakdown = json::array();
    for (auto &r : user.getRecords()) {
        breakdown.push_back({
            {"name", r.name},
            {"amount", std::round(r.amount * 100.0) / 100.0},
            {"emission", std::round(r.emission * 100.0) / 100.0}
        });
    }

    json response = {
        {"total_emission", std::round(total_emission * 100.0) / 100.0},
        {"breakdown", breakdown},
        {"debug_factors_per_unit", {
            {"car_per_km", car_factor_per_unit},
            {"bus_per_km", bus_factor_per_unit},
            {"electricity_per_kwh", electricity_factor_per_unit},
            {"meat_per_kg", meat_factor_per_unit},
            {"veg_per_kg", veg_factor_per_unit}
        }}
    };

    // Attach parsed raw_batch (or null) and warnings for callers to inspect
    if (!raw_batch.is_null() && !raw_batch.empty()) {
        response["climatiq_batch"] = raw_batch;
    } else {
        response["climatiq_batch"] = nullptr;
    }

    if (!warnings.empty()) {
        response["climatiq_warnings"] = warnings;
    }

    res.set_content(response.dump(2), "application/json");
}

// Simple, deterministic explanation generator (unchanged)
static json local_explain_suggestions(const json &payload) {
    json out;
    out["assistant_text"] = "";
    json parsed;
    parsed["summary"] = "";
    parsed["suggestions"] = json::array();

    double total = 0.0;
    if (payload.contains("total_emission")) {
        total = payload["total_emission"].get<double>();
    } else if (payload.contains("breakdown") && payload["breakdown"].is_array()) {
        for (const auto &b : payload["breakdown"]) total += b.value("emission", 0.0);
    }

    std::ostringstream s;
    s << "Estimated total emissions: " << std::round(total * 100.0) / 100.0 << " kg CO2.";
    parsed["summary"] = s.str();
    out["assistant_text"] = s.str();

    if (payload.contains("breakdown") && payload["breakdown"].is_array()) {
        std::vector<std::pair<double, std::string>> items;
        for (const auto &b : payload["breakdown"]) {
            std::string name = b.value("name", std::string("Unknown"));
            double emission = b.value("emission", 0.0);
            items.emplace_back(emission, name);
        }
        std::sort(items.begin(), items.end(), [](auto &a, auto &b){ return a.first > b.first; });

        int added = 0;
        for (auto &p : items) {
            if (added >= 3) break;
            double e = p.first;
            std::string name = p.second;
            if (e <= 0.0) continue;
            std::string suggestion;
            if (name.find("Car") != std::string::npos || name.find("car") != std::string::npos) {
                suggestion = "Reduce car usage: try carpooling, shorter trips, or switch to public transport when possible.";
            } else if (name.find("Bus") != std::string::npos || name.find("bus") != std::string::npos) {
                suggestion = "Optimize public transport or combine trips to reduce bus travel emissions.";
            } else if (name.find("Electricity") != std::string::npos) {
                suggestion = "Lower home electricity use: use LED bulbs, efficient appliances, and unplug idle devices.";
            } else if (name.find("Meat") != std::string::npos) {
                suggestion = "Reduce high-emission meals: replace some meat meals with plant-based options.";
            } else if (name.find("Vegetarian") != std::string::npos) {
                suggestion = "Optimize food choices: source local produce and reduce food waste.";
            } else {
                suggestion = std::string("Reduce usage in ") + name + " where possible to lower emissions.";
            }
            parsed["suggestions"].push_back(suggestion);
            added++;
        }
    }

    if (parsed["suggestions"].empty()) {
        parsed["suggestions"].push_back("Your emissions are very low — continue low-impact habits and verify inputs.");
        parsed["suggestions"].push_back("Check appliances and travel habits for further reductions.");
    }

    out["ai_parsed"] = parsed;
    return out;
}

// Main application
int main(int /*argc*/, char* argv[]) {
    fs::path exe_path = fs::path(argv[0]).parent_path();
    load_dotenv(exe_path / ".env");

    httplib::Server svr;

    // Allow CORS for local frontend
    svr.set_pre_routing_handler([](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "http://localhost:5173");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (req.method == "OPTIONS") {
            res.status = 200;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    // Root endpoint
    svr.Get("/", [](const httplib::Request &, httplib::Response &res) {
        res.set_content("CarbonFootprintAnalyzer API - see /docs/index.html for Swagger UI", "text/plain");
    });

    // OpenAPI specification
    svr.Get("/openapi.json", [](const httplib::Request &, httplib::Response &res) {
        res.set_content(OPENAPI_JSON, "application/json");
    });

    // Serve static files
    svr.set_base_dir("./static");
    svr.Get("/docs", [](const httplib::Request &, httplib::Response &res) {
        res.set_redirect("/docs/index.html");
    });

    // API endpoints
    svr.Post("/calculate", handle_calculate);

    svr.Post("/explain", [&](const httplib::Request &req, httplib::Response &res) {
        json j;
        try {
            j = json::parse(req.body);
        } catch (...) {
            res.status = 400;
            res.set_content("{\"error\":\"Invalid JSON\"}", "application/json");
            return;
        }

        json payload;
        if (j.contains("total_emission") && j.contains("breakdown")) {
            payload = j;
        } else {
            double car_km, bus_km, electricity_kwh, meat_meals, veg_meals;
            if (!extract_nonneg_double(j, "car_km", car_km) ||
                !extract_nonneg_double(j, "bus_km", bus_km) ||
                !extract_nonneg_double(j, "electricity_kwh", electricity_kwh) ||
                !extract_nonneg_double(j, "meat_meals", meat_meals) ||
                !extract_nonneg_double(j, "veg_meals", veg_meals))
            {
                res.status = 400;
                res.set_content("{\"error\":\"Provide total_emission+breakdown or all numeric inputs\"}", "application/json");
                return;
            }

            Activity car("Car", 0.271), bus("Bus", 0.105), electricity("Electricity", 0.475),
                     meatMeals("Meat Meals", 7.0), vegMeals("Vegetarian Meals", 3.0);
            User user;
            user.addActivity(car, car_km);
            user.addActivity(bus, bus_km);
            user.addActivity(electricity, electricity_kwh);
            user.addActivity(meatMeals, meat_meals);
            user.addActivity(vegMeals, veg_meals);

            payload["total_emission"] = std::round(user.calculateTotalEmission() * 100.0) / 100.0;
            payload["breakdown"] = json::array();
            for (auto &r : user.getRecords()) {
                payload["breakdown"].push_back({
                    {"name", r.name},
                    {"amount", std::round(r.amount * 100.0) / 100.0},
                    {"emission", std::round(r.emission * 100.0) / 100.0}
                });
            }
        }

        sanitize_payload(payload);

        json out;
        out["payload"] = payload;

        std::string err;
        json ai_resp;
        const char* api_key = std::getenv("OPENAI_API_KEY");

        if (api_key && strlen(api_key) > 0) {
            if (call_openai_explain(payload, ai_resp, err)) {
                std::string assistant_text = ai_resp.value("assistant_text", std::string(""));
                json ai_parsed = parse_or_build_ai_parsed(assistant_text, payload);

                json ai_out;
                ai_out["assistant_text"] = assistant_text;
                ai_out["ai_parsed"] = ai_parsed;

                out["ai"] = ai_out;
                res.set_content(out.dump(2), "application/json");
                return;
            } else {
                json local_ai = local_explain_suggestions(payload);
                json ai_out;
                ai_out["assistant_text"] = local_ai.value("assistant_text", std::string(""));
                if (local_ai.contains("ai_parsed")) ai_out["ai_parsed"] = local_ai["ai_parsed"];
                else ai_out["ai_parsed"] = parse_or_build_ai_parsed(ai_out["assistant_text"].get<std::string>(), payload);

                out["ai"] = ai_out;
                out["warning"] = std::string("OpenAI unavailable: ") + err;
                res.set_content(out.dump(2), "application/json");
                return;
            }
        } else {
            json local_ai = local_explain_suggestions(payload);
            json ai_out;
            ai_out["assistant_text"] = local_ai.value("assistant_text", std::string(""));
            if (local_ai.contains("ai_parsed")) ai_out["ai_parsed"] = local_ai["ai_parsed"];
            else ai_out["ai_parsed"] = parse_or_build_ai_parsed(ai_out["assistant_text"].get<std::string>(), payload);
            out["ai"] = ai_out;
            out["note"] = "OpenAI API key not configured; using local rule-based suggestions.";
            res.set_content(out.dump(2), "application/json");
            return;
        }
    });

    std::cout << "Server running at http://localhost:8080\n";
    std::cout << "OpenAI API Key: " << (std::getenv("OPENAI_API_KEY") ? "Set" : "Not Set") << std::endl;

    svr.listen("0.0.0.0", 8080);
    return 0;
}
