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
| Auth     | Token-based login                            |

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

### Demo accounts

| Role  | Username | Password |
|-------|----------|----------|
| Owner | owner    | owner123 |
| Staff | ali      | staff123 |
| Staff | sara     | staff123 |

### API overview

| Method | Route | Who |
|--------|-------|-----|
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

## Team

| Member | Contribution |
|--------|--------------|
| _Member 1_ | _TBD_ |
| _Member 2_ | _TBD_ |
