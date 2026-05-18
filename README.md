# Mini CRM (React + Express + MySQL)

A polished lead management dashboard built with React, Vite, Tailwind CSS, Express, Sequelize, and MySQL.

## Features
- JWT authentication and admin login
- Lead CRUD with status workflow
- Notes per lead for follow-up tracking
- Search, filters, and CSV export
- Dashboard analytics and lead status charts
- MySQL backend with Sequelize ORM

## Quick start
1. Copy the env template:
   - `cp .env.example .env`
   - `cp server/.env.example server/.env`
2. Update `DB_PASS` and `JWT_SECRET` in `server/.env`
3. Install backend dependencies:
   - `cd server && npm install`
4. Install frontend dependencies:
   - `cd ../client && npm install`
5. Create the database:
   - `cd ../server && npm run createdb`
6. Seed sample data:
   - `npm run seed`
7. Start the backend:
   - `npm run dev`
8. Start the frontend:
   - `cd ../client && npm run dev`
9. Open the app:
   - `http://localhost:5175`

## Demo credentials
- Email: `admin@demo.com`
- Password: `password`

## Project structure
- `server/` — Express API, Sequelize models, MySQL integration
- `client/` — React Vite app, Tailwind UI, dashboard and lead management

## Notes
- Use `server/create-db.js` to ensure the database exists.
- Use `server/sample.seed.js` to reset sample data and admin account.
