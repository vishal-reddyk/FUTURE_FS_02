# Mini CRM Server

Backend API for the Mini CRM app, built with Express, Sequelize, and MySQL.

## Setup
1. Install dependencies: `npm install`
2. Copy env example: `cp .env.example .env`
3. Update `server/.env` with your MySQL credentials and `JWT_SECRET`
4. Create the database: `npm run createdb`
5. Seed demo data: `npm run seed`
6. Run the server: `npm run dev`

## API endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/leads`
- GET `/api/leads/summary`
- POST `/api/leads`
- GET `/api/leads/:id`
- PUT `/api/leads/:id`
- DELETE `/api/leads/:id`
- POST `/api/leads/:id/notes`

## Notes
- The backend uses JWT auth for all lead routes.
- `server/sample.seed.js` creates an admin user and sample lead data.
