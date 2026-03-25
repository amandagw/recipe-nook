# The Recipe Nook

A scrapbook-inspired Next.js MVP for saving recipes, organizing them into folders, logging cooking journal entries, and planning meals for the week.

## Included MVP surfaces

- Recipe capture cards for URL import and manual entry
- Searchable recipe library with folder, status, and difficulty filters
- Recipe detail inspector with cooking journal insights
- Meal planning and shopping list views
- Example Next.js API routes for recipes and planner data

## Tech choices

- Next.js App Router
- React 19
- TypeScript
- MongoDB Atlas-ready backend utilities
- Cookie-based authentication with hashed passwords

## Getting started

1. Install dependencies with `npm install`.
2. Create `.env.local` based on `.env.example`.
3. Add your MongoDB Atlas connection string to `MONGODB_URI`.
4. Add a long random string to `AUTH_SECRET`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Implemented database-backed auth

- `POST /api/auth/signup` creates a user in MongoDB and starts a session
- `POST /api/auth/login` verifies credentials and starts a session
- `POST /api/auth/logout` clears the session cookie
- `GET /api/auth/session` returns the current logged-in user

## Database foundation for next features

- `users` collection for account records
- `recipes` collection for recipe cards and metadata
- `recipeNotes` collection for cooking notes and journal entries
- `mealPlans` collection for weekly planning
- `shoppingLists` collection for ingredient lists

## Suggested production follow-up

- Replace remaining mock data on the homepage with MongoDB-backed queries
- Implement server-side URL extraction with robust parsing and validation
- Add CRUD routes and forms for recipes, notes, meal plans, and shopping lists
