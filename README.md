# Data Platform Project Setup

This project has been developed over time by students in the CIS 4339 course.

The current iteration is based on development done by:
* Jeremy Griffith and Edwin Charly in Spring of 2023
* Elliot Farmer Garcia, Agatha	Molski and Chris Blanco in Fall of 2022.

## Requirements

This project uses NodeJS, VUEJS and MongoDB.

- Node.js **18 or newer** (tested with Node 20 and 22)
- npm (comes with Node.js)
- A MongoDB database for the backend

## Backend Node Application
```
cd backend
```
Follow instructions in backend README for setup and running as a local instance.

## Frontend Vue 3 Application
```
cd frontend
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build into frontend/dist
npm run serve      # serve the production build at http://localhost:4173
```
See the frontend README for the `VITE_ROOT_API` setting, the page-refresh (SPA fallback) setup, and deploying to Netlify.
