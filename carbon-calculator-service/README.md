# CarbonFootprintAnalyzer

Simple, portable C++ console application that computes an individual's approximate carbon footprint from daily activities and provides suggestions. Saves history to `data/footprint_history.csv`.

## Features (MVP)

- Track activities: Car (km), Bus (km), Electricity (kWh), Meat Meals, Vegetarian Meals.
- Calculates kg CO₂ for each activity using fixed emission factors.
- Prints a category-wise report, total footprint, and reduction suggestions.
- Appends a timestamped record to `data/footprint_history.csv`.

## Requirements

- C++ compiler supporting C++17 (g++, clang, MSVC)
- CMake >= 3.10
- Git (optional)

## Build (Linux/macOS)

```bash
git clone <repo-url> CarbonFootprintAnalyzer
cd CarbonFootprintAnalyzer
mkdir build && cd build
cmake ..
cmake --build .
./CarbonFootprintAnalyzer
```
