# TailorTrack – Tailoring Shop Management System

Web Programming Project, Fall 2026 (group of 2).

TailorTrack replaces a tailoring shop's paper notebooks with one web app. It keeps customer
measurements, orders, payments and delivery dates in one place. The shop owner manages customers and
orders, and staff update the orders assigned to them.

## Features

- **Accounts and permissions**: Owner and Staff login/logout. Only the owner can add staff accounts (nobody can sign up as Owner). Staff can view and update only their assigned orders. Every rule is checked by the API, not only by hiding buttons.
- **Customers and measurements**: add, view, edit and search customers by name or phone. Each customer page shows their saved measurements and order history, and has a button to start a new order. Customers with order history are archived instead of deleted and can be restored.
- **Orders and assignment**: each order is linked to a customer and an active staff member. It keeps its own copy of the measurements, so editing the customer later does not change old orders. It also stores garment type, instructions, price, advance payment, due date and the staff work rate.
- **Order progress**: Pending → In progress → Ready → Delivered. Overdue unfinished orders are highlighted. Orders can be filtered by status (including "active", meaning not delivered), staff member, due date range, overdue, or customer name/phone. Filters are kept in the page URL.
- **Payments and dashboard**: payments are recorded by hand and the remaining balance is calculated. The dashboard shows active, ready and overdue counts (each links to the matching orders) and deliveries due in the next 7 days. Order details have a printable summary using the browser's print.
- **Garment photos and staff work summary**: JPG/PNG/WEBP photos up to 2 MB, viewable only by the owner and the assigned staff member. The staff page shows each person's completed orders (Ready or Delivered) and the total of their work rates.
- **Responsive layout**: works on phones (collapsible menu) and desktops.

## Business rules

| Rule | Where it is checked |
|------|---------------------|
| Price must be greater than 0; advance and payments cannot be negative | form + API |
| Total paid (advance + payments) can never be more than the price | form + API |
| Due date cannot be set in the past | form + API |
| Status can only move one step: Pending ↔ In progress ↔ Ready → Delivered | API (buttons only show allowed steps) |
| Staff can move their own orders up to Ready; only the owner marks Delivered | API |
| Delivered orders cannot be edited | API (Edit button hidden) |
| Orders can only be assigned to active staff members | API |
| Staff with Pending or In progress orders cannot be deactivated until those are reassigned | API |
| Customers with orders are archived, not deleted; archived customers cannot get new orders | API |
| Photos must be JPG, PNG or WEBP and at most 2 MB | form + API |

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
| GET | /api/orders?status=&staff=&from=&to=&overdue=&search= (`status=active` = not delivered) | owner (all), staff (assigned only) |
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
| Rabail Fatima | Project setup; Express server, MongoDB models, auth, customer and order APIs, photo upload and seed data; React setup with Vite, Tailwind and Redux; login, dashboard, customers, customer details, order form, order details and theme |
| Mahnoor | Staff page and work summary; editing customers, staff and orders; server hardening (env checks, health check, login limits, secure cookie); order search, filters and active filter; dashboard links; mobile menu; business-rule checks; session expiry; print summary; sample data; README |
