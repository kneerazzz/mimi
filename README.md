💡 MimiBoard: The Contextual Meme Generator

🌟 Overview

MimiBoard is a next-generation social application that combines content discovery with AI-powered creative tools. Our core feature analyzes a user's real-life scenario (e.g., "I worked 10 hrs today") using the Gemini API, extracts the emotional context, and matches it with the perfect meme template to generate highly relatable, personalized content.

Core Value

We eliminate the tedious search for the perfect reaction image by using contextual AI matching and providing a smooth, progressive editing experience.

🔥 Key Application Features

Feature

Description

Contextual AI Generation

User input (scenario) is analyzed by Gemini to provide an optimal template and short caption. The system matches the scenario's emotion tags (e.g., tired, frustrated) against our template library to suggest the perfect meme base.

Progressive Editor

Offers a streamlined creation workflow: Simple Mode (Top/Bottom text, Black/White color, size) for quick edits, with an optional Advanced Mode (X/Y coordinates, fonts, layering) unlocked for complex designs.

Template Management

Users can Save Templates to a personal gallery for easy reuse. This is key for speed and personalization within the editor workflow.

Discovery Feed

Fast, stable infinite scroll feed fueled by fresh, cached content pulled from the public Reddit API.

Optional Login

Every visitor is tracked anonymously via a UUID. All cached preferences, saved items, and generated memes are retained and converted into a permanent account upon registration.

Social Layer

Comprehensive Polymorphic system for Liking, Commenting, and Saving any content (Discovery or Created Memes).

🛠️ Technology Stack

Category

Technology

Frontend

Next.js (React)

Backend

Node.js, Express.js

Database

MongoDB (Mongoose)

AI/Tools

Google Gemini API, Reddit API

🚀 Quick Start (Backend)

Clone the repository and navigate to the server/ directory.

Install dependencies: npm install

Create a .env file and populate it with your MONGODB_URI, authentication secrets, and GEMINI_API_KEY.

Run the server: npm start