# Ticket Booking + Wallet + Admin System Backend

A robust, production-ready RESTful backend API for an event ticket booking system with integrated wallet payments and administrative management. Built using Node.js, Express, and MongoDB (via Mongoose), the system features ACID-compliant multi-document transactions, atomic concurrency controls against double-booking and double-spending, lazy reservation expiration, and idempotency guarantees for financial and booking operations.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation & Execution](#installation--execution)
  - [Enabling MongoDB Replica Set Locally](#enabling-mongodb-replica-set-locally)
- [API Overview](#api-overview)
  - [Auth Module (`/api/auth`)](#auth-module-apiauth)
  - [Wallet Module (`/api/wallet`)](#wallet-module-apiwallet)
  - [Event Module (`/api/events`)](#event-module-apievents)
  - [Booking Module (`/api/bookings`)](#booking-module-apibookings)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Folder Structure](#folder-structure)

---

## Tech Stack

The core dependencies powering this application (as specified in `package.json`) include:

- **[Express](https://expressjs.com/) (`^5.2.1`)**: Fast, unopinionated web framework for Node.js.
- **[Mongoose](https://mongoosejs.com/) (`^9.8.1`)**: Object Data Modeling (ODM) library for MongoDB providing schema validation and transaction management.
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (`^9.0.3`)**: Stateless authentication via JSON Web Tokens (JWT).
- **[bcryptjs](https://github.com/dperini/bcrypt.js) (`^3.0.3`)**: Secure password hashing algorithms.
- **[dotenv](https://github.com/motdotla/dotenv) (`^17.4.2`)**: Environment variable management.
- **[cors](https://github.com/expressjs/cors) (`^2.8.6`)**: Cross-Origin Resource Sharing middleware.

---

## Setup Instructions

### Prerequisites

- **Node.js**: Version 18 or higher recommended.
- **MongoDB**: MongoDB instance with Replica Set support enabled (required for multi-document ACID transactions via `session.withTransaction`).
  - **MongoDB Atlas**: Clusters have replica sets enabled by default.
  - **Local MongoDB**: Requires initiating a single-node replica set.

### Installation & Execution

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <repository-url>
   cd ticket-booking-backend
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to create `.env` in the root directory:

   ```bash
   cp .env.example .env
   ```

   **Required `.env` Variables:**
   | Variable | Description | Example |
   | :--- | :--- | :--- |
   | `PORT` | The port number on which the Express server listens. | `3000` |
   | `MONGODB_URI` | MongoDB connection URI with replica set support. | `mongodb://localhost:27017/ticket_booking` |
   | `JWT_SECRET` | Secret key used for signing and verifying JWT authentication tokens. | `your_jwt_secret_key` |

3. **Running the Application Locally:**
   - **Development mode** (with `--watch` auto-reloading):
     ```bash
     npm run start:dev
     ```
   - **Production mode**:
     ```bash
     npm run start:prod
     ```

### Enabling MongoDB Replica Set Locally

Since MongoDB multi-document transactions require a replica set:

1. Start your local MongoDB server with replica set enabled:
   ```bash
   mongod --dbpath /path/to/data --replSet rs0
   ```
2. Open `mongosh` or MongoDB Shell and initiate the replica set:
   ```js
   rs.initiate();
   ```

---

## API Overview

Below is a summary of all implemented endpoints. For complete request payloads and response contracts, refer to the provided Postman collection.

### Auth Module (`/api/auth`)

| Method | Route                   | Auth   | Description                                                              |
| :----- | :---------------------- | :----- | :----------------------------------------------------------------------- |
| `POST` | `/api/auth/signup`      | Public | Register a new user and automatically initialize a wallet with 0 balance |
| `POST` | `/api/auth/login`       | Public | Authenticate user credentials and return a JWT access token              |
| `POST` | `/api/auth/admin/login` | Public | Authenticate admin credentials and return an admin JWT token             |

### Wallet Module (`/api/wallet`)

| Method | Route                            | Auth  | Description                                                         |
| :----- | :------------------------------- | :---- | :------------------------------------------------------------------ |
| `POST` | `/api/wallet/credit`             | User  | Credit funds to user wallet (Requires `Idempotency-Key` header)     |
| `GET`  | `/api/wallet/balance`            | User  | Retrieve current user's wallet balance                              |
| `GET`  | `/api/wallet/transactions`       | User  | Get paginated list of user's wallet transactions                    |
| `GET`  | `/api/wallet/admin/transactions` | Admin | Get paginated list of all system transactions with optional filters |

### Event Module (`/api/events`)

| Method   | Route                        | Auth   | Description                                                |
| :------- | :--------------------------- | :----- | :--------------------------------------------------------- |
| `POST`   | `/api/events`                | Admin  | Create a new event                                         |
| `PUT`    | `/api/events/:id`            | Admin  | Update event details (name, date, description, price)      |
| `DELETE` | `/api/events/:id`            | Admin  | Cancel an active event                                     |
| `GET`    | `/api/events`                | Public | List all events with pagination and status filters         |
| `GET`    | `/api/events/:id`            | Public | Get detailed information for a single event                |
| `GET`    | `/api/events/:id/seats`      | Public | View seat map/availability for an event (filter by status) |
| `POST`   | `/api/events/:id/seats/bulk` | Admin  | Bulk generate seats for an active event                    |

### Booking Module (`/api/bookings`)

| Method | Route                      | Auth  | Description                                                              |
| :----- | :------------------------- | :---- | :----------------------------------------------------------------------- |
| `POST` | `/api/bookings/reserve`    | User  | Temporarily reserve available seats for 5 minutes                        |
| `POST` | `/api/bookings/confirm`    | User  | Confirm reservation and debit wallet (Requires `Idempotency-Key` header) |
| `POST` | `/api/bookings/:id/cancel` | Admin | Cancel a confirmed booking and issue a full wallet refund                |
| `GET`  | `/api/bookings/my`         | User  | Get paginated list of current user's bookings                            |
| `GET`  | `/api/bookings/admin`      | Admin | Get paginated list of all system bookings                                |

---

## Design Decisions

- **Seat State Machine (`AVAILABLE` -> `RESERVED` -> `BOOKED`)**:
  - Instead of maintaining a separate `reservations` collection, reservation state is tracked inline directly on `Seat` documents via fields (`status`, `reservedBy`, `reservedAt`, `expiresAt`, `bookedBy`, `reservationGroupId`).
  - This enables single-document atomic update queries (`findOneAndUpdate`) and avoids multi-collection lookup overhead.
  - Multi-seat holds are logically linked using a unique `reservationGroupId` (UUID v4).

- **Concurrency Control & Double-Booking / Double-Spending Prevention**:
  - **Seat Reservation**: Uses atomic `findOneAndUpdate` queries guarded by status checks (`status: "AVAILABLE"` or expired `RESERVED`). Simultaneous reservation requests for the same seat resolve atomically so only one caller succeeds.
  - **Wallet Debit**: Uses conditional atomic updates (`balance: { $gte: amount }`) with `$inc: { balance: -amount }`. If balance is insufficient, the update fails atomically, preventing negative balances and double-spending.

- **Transaction Atomicity**:
  - Critical workflows (wallet debit + transaction record + seat status transition `RESERVED` -> `BOOKED` + booking creation) are wrapped inside a MongoDB multi-document ACID transaction using `session.withTransaction`. If any step fails, all changes roll back completely.

- **Lazy Expiry Enforcement (No Cron Jobs)**:
  - Expired reservations are checked and cleaned **lazily** at critical execution touchpoints:
    1. **New Reservation Attempt**: Reclaims expired seats where `expiresAt < now`.
    2. **Booking Confirmation**: Enforces `expiresAt >= now` check before proceeding.
    3. **Seat Map Fetch**: Bulk cleans expired seats (`updateMany`) before returning availability lists.

- **Idempotency**:
  - Financial write endpoints (`POST /api/wallet/credit` and `POST /api/bookings/confirm`) enforce an `Idempotency-Key` HTTP header.
  - Database schemas enforce a unique index on `idempotencyKey`. Duplicate requests return the original result payload without re-processing balance changes or duplicate bookings.

- **Derived Counter (`totalSeats`)**:
  - The `totalSeats` field on `Event` is a derived counter updated only by the bulk seat creation endpoint via atomic `$inc: { totalSeats: count }`, ensuring data integrity.

- **Three-State Event Lifecycle (`ACTIVE`, `CANCELLED`, `ENDED`)**:
  - Events naturally transition from `ACTIVE` to `ENDED` lazily whenever reservation operations evaluate `eventDate < now`.

---

## Assumptions

1. **Password Length**: User passwords are assumed to be a minimum of 6 characters long.
2. **Admin Account Provisioning**: Admin accounts are created/seeded directly in the database with `role: "ADMIN"`. The public `/api/auth/signup` endpoint creates standard `USER` accounts.
3. **Monetary Values**: All prices, balances, and transaction amounts are stored as non-negative integers representing smallest currency units (paise/cents) to prevent floating-point precision issues.
4. **JWT Verification**: JWT payload data (`id`, `role`) is trusted upon verification without re-querying the user collection on every request. Role updates take effect upon token renewal.
5. **Lazy System State**: No background worker or cron scheduler is used; seat expiration and event state transitions are lazily applied on read/write.
6. **Bulk Seat Numbering**: Seat numbering in bulk creation continues sequentially from the event's current `totalSeats` count (`startNum = totalSeats + 1`).

---

## Known Limitations

- **Concurrency in Bulk Seat Creation**: If two admin requests invoke `POST /api/events/:id/seats/bulk` simultaneously, both threads may read the same baseline `totalSeats`, causing a MongoDB duplicate-key error (`E11000`) on the `(eventId, seatNumber)` unique index rather than executing a graceful partial insert.
- **Seat Map Detail Scope**: The seat availability endpoint (`GET /api/events/:id/seats`) returns only `seatNumber` and `status` for all users, including admins. Detailed user assignment for reserved/booked seats is not currently returned by this endpoint.

---

## Folder Structure

```text
ticket-booking-backend/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── src/
    ├── index.js
    ├── booking/
    │   ├── controller/
    │   │   ├── all-bookings.js
    │   │   ├── cancel.js
    │   │   ├── confirm.js
    │   │   ├── index.js
    │   │   ├── reserve.js
    │   │   └── user-bookings.js
    │   ├── helper/
    │   │   └── booking.helper.js
    │   ├── model/
    │   │   └── booking.model.js
    │   ├── routes/
    │   │   └── index.js
    │   └── service/
    │       ├── all-bookings.js
    │       ├── cancel.js
    │       ├── confirm.js
    │       ├── reserve.js
    │       └── user-bookings.js
    ├── common/
    │   ├── middleware/
    │   │   ├── auth.middleware.js
    │   │   └── idempotency.middleware.js
    │   └── utils/
    │       └── run-transaction.js
    ├── config/
    │   └── db.js
    ├── event/
    │   ├── controller/
    │   │   ├── bulk-create-seats.js
    │   │   ├── cancel-event.js
    │   │   ├── create-event.js
    │   │   ├── get-event-seats.js
    │   │   ├── get-event.js
    │   │   ├── index.js
    │   │   ├── list-events.js
    │   │   └── update-event.js
    │   ├── model/
    │   │   ├── event.model.js
    │   │   └── seat.model.js
    │   ├── routes/
    │   │   └── index.js
    │   └── service/
    │       ├── bulk-create-seats.js
    │       ├── cancel-event.js
    │       ├── create-event.js
    │       ├── get-event.js
    │       ├── get-seat-map.js
    │       ├── list-events.js
    │       └── update-event.js
    ├── user/
    │   ├── controller/
    │   │   ├── admin-login.js
    │   │   ├── index.js
    │   │   ├── signup.js
    │   │   └── user-login.js
    │   ├── model/
    │   │   └── user.model.js
    │   ├── routes/
    │   │   └── index.js
    │   └── service/
    │       ├── admin-login.js
    │       ├── signup.js
    │       └── user-login.js
    └── wallet/
        ├── controller/
        │   ├── all-transactions.js
        │   ├── balance.js
        │   ├── credit.js
        │   ├── index.js
        │   └── list-transactions.js
        ├── model/
        │   ├── transaction.model.js
        │   └── wallet.model.js
        ├── routes/
        │   └── index.js
        └── service/
            ├── all-transactions.js
            ├── check-balance.js
            ├── credit.js
            └── list-transaction.js
```
