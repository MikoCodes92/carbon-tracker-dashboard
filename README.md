**Carbon Tracker Microservices
**
Description
Carbon Tracker is a real-time carbon footprint monitoring system. It integrates the Climatox API for emissions data, a C++ microservice for calculations, Django for authentication, and OpenAI for actionable insights. The platform supports tracking energy, transportation, and diet-related emissions.

Features

Real-time carbon footprint calculation

Microservice architecture with C++ backend and HTTP API

Authentication using Django

AI-driven recommendations using OpenAI

Supports multiple emission sources: electricity, transport, and food

Tech Stack

Frontend: React + Vite

Backend: C++ microservice (CarbonFootprintAnalyzer.exe)

Authentication: Django REST API

AI: OpenAI API for insights

APIs: Climatox API

Getting Started

Clone the repository

git clone https://github.com/<username>/carbon-tracker.git
cd carbon-tracker


Frontend setup

cd carbon-frontend
npm install
npm run dev


Frontend runs at: http://localhost:5173

C++ microservice setup

cd carbon-calculator-service/build
./CarbonFootprintAnalyzer.exe


Server runs at: http://localhost:8080

Django authentication service

cd carbon-auth-service
python manage.py runserver


Environment Variables

OPENAI_API_KEY → OpenAI API key

CLIMATOX_API_KEY → Climatox API key

Usage

Track carbon emissions by inputting data for electricity, transport, and meals.

Get AI-generated recommendations for reducing your carbon footprint.
