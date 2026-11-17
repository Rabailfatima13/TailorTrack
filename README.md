# TailorTrack – Tailoring Shop Management System

Web Programming Project, Fall 2026 (group of 2).

TailorTrack replaces a tailoring shop's paper notebooks with one web app. It keeps customer
measurements, orders, payments and delivery dates in one place. The shop owner manages customers and
orders, and staff update the orders assigned to them.

## Features (planned)

- **Accounts and permissions**: Owner and Staff login/logout. Staff can view and update only their assigned orders.
- **Customers and measurements**: create, view, edit and search customers (by name or phone). Customers with order history are archived instead of deleted.
- **Orders and assignment**: each order is linked to a customer and stores its own copy of the measurements, plus garment type, instructions, price, advance payment, due date and the assigned staff member.
- **Order progress**: Pending → In progress → Ready → Delivered, with overdue highlighting and filters by status, staff member or due date.
- **Payments and dashboard**: manual payment entries, a calculated remaining balance, counts of active, ready and overdue orders, and a printable order summary.
- **Garment photos and staff work summary**: validated photo upload, a per-order work rate, and each staff member's completed orders and earned total.

## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React + TypeScript (Vite), Redux, Tailwind CSS |
| Backend  | Node.js, Express (REST API)                  |
| Database | MongoDB (Mongoose)                           |
| Auth     | JWT stored in an httpOnly cookie             |

## Project structure

```
TailorTrack/
├── client/   # React frontend
├── server/   # Express backend + REST API
└── docs/     # Project proposal and documentation
```

## Setup

You need Node.js 18+ and MongoDB running locally.

### Backend

```
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

The API runs on `http://localhost:5000/api`.

### Environment variables

Set these in `server/.env` (copy `server/.env.example`); the server stops at startup and names any required variable that is missing.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Long random string used to sign login tokens; never commit it |
| `CLIENT_URL` | yes | Frontend address allowed by CORS (default `http://localhost:5173`) |
| `PORT` | no | Port for the API; defaults to `5000` |
| `NODE_ENV` | no | Set to `production` when deploying; enables the secure cookie flag |

### Frontend

Open a second terminal while the backend is running:

```
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in the browser. Requests to `/api` are forwarded to the backend by Vite, so the login cookie works without extra setup.

### Demo accounts

| Role  | Username | Password |
|-------|----------|----------|
| Owner | owner    | owner123 |
| Staff | ali      | staff123 |
| Staff | sara     | staff123 |

### API overview

| Method | Route | Who |
|--------|-------|-----|
| GET | /api/health | everyone |
| POST | /api/auth/login, /api/auth/logout | everyone |
| GET | /api/auth/me | logged in |
| GET, POST | /api/customers | owner |
| GET, PUT, DELETE | /api/customers/:id | owner |
| GET | /api/orders | owner (all), staff (assigned only) |
| POST | /api/orders | owner |
| GET | /api/orders/:id | owner, assigned staff |
| PUT, DELETE | /api/orders/:id | owner |
| PATCH | /api/orders/:id/status | owner, assigned staff (up to Ready) |
| POST | /api/orders/:id/payments | owner |
| POST | /api/orders/:id/photo | owner |
| GET | /api/orders/:id/photo | owner, assigned staff |
| GET | /api/dashboard | logged in |
| GET, POST | /api/users/staff | owner |
| PUT | /api/users/staff/:id | owner |
| GET | /api/users/staff/summary | owner |

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- Login attempts are limited: after 10 wrong passwords for the same username from the same IP address, login is blocked for 15 minutes (HTTP 429).
- The login cookie is `httpOnly` (not readable by JavaScript) and, when `NODE_ENV=production`, `secure` (sent over HTTPS only).

## Team

| Member | Contribution |
|--------|--------------|
| _Member 1_ | _TBD_ |
| _Member 2_ | _TBD_ |
