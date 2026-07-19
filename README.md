# Backend Service (Node.js + Express + Sequelize)

This project is a backend service built using Node.js, Express, Sequelize, and PostgreSQL.  
It powers a matchmaking platform with features like user management, admin control, notifications, payments, and real-time communication.

The system is modular, scalable, and designed to handle production-level workloads.

---

## Overview

This backend provides:

- User authentication and profile management  
- Admin dashboard APIs  
- Recommendation and matching system  
- Subscription and billing system  
- Real-time communication using sockets  
- Notification system (push + scheduled jobs)  
- File upload and media handling  
- Contact and application management  

---

## Architecture

The system is divided into:

- API Layer (Express routes)
- Database Layer (Sequelize models)
- Services (business logic)
- Middleware (auth, error handling)
- Background Workers (notifications)
- External Integrations (email, storage, payments)

---

## Project Flow (Brick by Brick)

### 1. Server Initialization

Steps:

1. Load environment variables  
2. Connect to database  
3. Initialize Express app  
4. Attach middleware  
5. Register routes  
6. Sync database models  
7. Start HTTP server  
8. Initialize socket server  
9. Start background scheduler  

---

### 2. Database Connection

- Uses PostgreSQL with Sequelize  
- Connection retries on failure  
- Logging is disabled for cleaner output  

```
Sequelize → connect → authenticate → retry if failed
```

---

### 3. Model Synchronization

All models are synced on startup:

- User
- Profile-related tables
- Plans and subscriptions
- Notifications
- Admin and logs
- Contact and applications

Safe mode is used:

```
sync({ force: false })
```

This prevents data loss.

---

### 4. Public User ID Backfill

Purpose:

- Ensure every user has a unique public ID  

Logic:

1. Find users without public_user_id  
2. Generate random ID (7–8 characters)  
3. Check uniqueness  
4. Save without triggering hooks  

This runs automatically after user table sync.

---

### 5. API Structure

Routes are grouped by domain:

### User APIs
```
/api/v1/user
/api/v1/profile
/api/v1/connection
/api/v1/happyStories
```

### Plan & Subscription
```
/api/v1/plan
/api/v1/subscription
/api/v1/billing
```

### Communication
```
/api/v1/call
/api/v1/notifications
/api/v1/fcm-notification
```

### Admin APIs
```
/api/admin/
```

Includes:

- authentication
- dashboard
- user control
- transactions
- banner
- contacts

---

### 6. Authentication System

#### User Authentication

- JWT-based authentication  
- Tokens stored in cookies  
- Session stored in Redis  

Flow:

1. Login → generate tokens  
2. Save session in Redis  
3. Attach token to requests  
4. Validate token on each request  

---

#### Admin Authentication

- Uses Bearer token  
- Validates via Redis session  
- Separate middleware for admin access  

---

### 7. Redis Usage

Used for:

- session storage  
- notification queue  
- caching (optional)  

Features:

- auto reconnect  
- safe failure handling  
- does not crash app if Redis fails  

---

### 8. Notification System

There are two parts:

#### 1. Queue System

- User IDs are added to queue  
- Stored in Redis  

#### 2. Worker

- Runs in background  
- Processes notifications in batches  
- Sends push notifications  

#### 3. Scheduler

- Runs every 10 minutes  
- Triggers worker  
- Prevents duplicate runs  

---

### 9. Real-Time Communication

- Uses Socket.IO  
- Initialized with HTTP server  
- Enables live updates and messaging  

---

### 10. File Upload System

Supports:

- Cloud storage upload  
- Buffer upload  
- Local file cleanup  

Used for:

- user images  
- documents  
- banners  

---

### 11. Email Service

- Uses SMTP transporter  
- Templates rendered using EJS  
- Sends OTPs and notifications  

---

### 12. WhatsApp Integration

- Sends OTP via external API  
- Normalizes phone numbers  
- Logs success and errors  

---

### 13. Payment Integration

Supports:

- Razorpay  
- Stripe  

Used for:

- subscriptions  
- billing  
- transactions  

---

### 14. Middleware

Includes:

- authentication middleware  
- admin authentication  
- error handler  
- async error wrapper  

---

### 15. Error Handling

Centralized error handler:

```
ErrorMiddleware → catches all errors → sends structured response
```

Prevents app crashes and ensures consistent API responses.

---

### 16. Health Check Endpoint

```
GET /test
```

Returns:

- service status  
- uptime  
- timestamp  

Used for:

- Docker health checks  
- load balancer monitoring  

---

## Deployment

Uses Docker with multiple services:

- backend container  
- PostgreSQL database  
- Redis  

Supports blue-green deployment strategy:

- backend-blue  
- backend-green  

This allows zero downtime deployments.

---

## CI/CD

- Triggered on push to main branch  
- Connects to server via SSH  
- Pulls latest code  
- Rebuilds containers  
- Restarts services  

---

## Tech Stack

- Node.js  
- Express  
- Sequelize  
- PostgreSQL  
- Redis  
- Socket.IO  
- Docker  

---

## Environment Variables

Do not commit real values. Use `.env`.

Example:

```
PORT=3000
DATABASE=your_db
USER=your_user
PASSWORD=your_password
HOST=your_host

JWT_SECRET=your_secret
REDIS_URL=your_redis_url

SMTP_HOST=your_smtp_host
SMTP_MAIL=your_email
SMTP_PASSWORD=your_password
```

---

## How to Run

### Install dependencies
```
npm install
```

### Start development server
```
npm run dev
```

---

## Developer Notes

- Never commit `.env` file  
- Always use environment variables for secrets  
- Avoid using `sync({ force: true })` in production  
- Redis failures should not crash the app  
- Use async error wrapper for all controllers  
- Validate all inputs using Joi  

---


---

## Summary

This backend is a full-featured system that includes:

- authentication  
- admin control  
- notifications  
- payments  
- real-time features  

It is structured to support scalable and production-ready applications.

---
