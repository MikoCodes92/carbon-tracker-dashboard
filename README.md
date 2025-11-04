# 🌍 Carbon Tracker Microservices

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)]

---

## 🔹 About
**Carbon Tracker** monitors and analyzes your **carbon footprint** from daily activities.  
Powered by **C++ microservices**, **Django auth**, **Climatox API**, and **OpenAI AI suggestions**.

---

## 🔹 Features
- Real-time carbon calculations  
- AI-driven reduction tips  
- Tracks energy, transport, and food emissions  

---

## 🔹 Tech Stack
- **Frontend:** React, Vite, Tailwind  
- **Backend:** C++ microservices  
- **Auth:** Django REST  
- **AI:** OpenAI GPT  
- **API:** Climatox  

---

## 🔹 Quick Start

```bash
git clone https://github.com/<username>/carbon-tracker.git
cd carbon-tracker

# Frontend
cd carbon-frontend
npm install
npm run dev

# C++ Microservice
cd ../carbon-calculator-service/build
./CarbonFootprintAnalyzer.exe

# Django Auth
cd ../carbon-auth-service
python manage.py migrate
python manage.py runserver
