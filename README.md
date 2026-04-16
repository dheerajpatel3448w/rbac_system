# PurpleMerit RBAC System

A robust, full-stack **Role-Based Access Control (RBAC)** application built using the modern MERN stack. Designed with security, performance, and best practices in mind, this project provides a scalable foundation for applications requiring granular user permission management.

## 🚀 Features

- **MERN Stack Architecture**: MongoDB, Express.js, React (with Vite), and Node.js.
- **Strict Role Hierarchy**: Complete separation of concerns enforcing absolute boundaries:
  - **Admin**: Has overarching control to create, edit, and delete Managers and Users.
  - **Manager**: Can oversee and edit strictly "User" accounts without affecting higher levels.
  - **User**: Standard account limited to managing their own profile.
- **Secure Authentication**: Implementation of rotating JWTs (Access and Refresh tokens) stored securely.
- **Robust Validation**: End-to-end type safety and payload validation using Zod schemas.
- **Containerization**: Fully Dockerized for zero-configuration deployments using Docker Compose.
- **Dynamic Frontend**: Modern UI leveraging React Hook Form, Framer Motion for animations, and TanStack Table for efficient data rendering.

---

## 🛠️ Prerequisites

If you plan to run the project locally without Docker, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [pnpm](https://pnpm.io/) (used as the primary package manager)
- [MongoDB](https://www.mongodb.com/) (either locally installed or a MongoDB Atlas URI)
- [Docker & Docker Compose](https://www.docker.com/) (optional, for containerized execution)

---

## 💻 Local Setup Data (Development Mode)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/purplemerit-rbac-system.git
cd purplemerit-rbac-system
```

### 2. Environment Configuration
Navigate into both the frontend and backend directories to configure your `.env` files.

**Backend (`rbac-system-backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/userManagement
DB_NAME=userManagement

JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (`rbac-system-frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Install Dependencies
Install dependencies seamlessly using `pnpm` inside both sub-directories.
```bash
cd rbac-system-backend && pnpm install
cd ../rbac-system-frontend && pnpm install
```

### 4. Database Seeding (Crucial Step)
Before running the application for the first time, you must initialize the database and create the "Super Admin" account.
```bash
cd rbac-system-backend
pnpm run seed
```
*(This command will output the Admin Email, and securely formulated Admin Password to your terminal! Save these so you can log in).*

### 5. Start the Application
Run the development servers concurrently in two separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd rbac-system-backend
pnpm run dev
```

**Terminal 2 (Frontend):**
```bash
cd rbac-system-frontend
pnpm run dev
```
Navigate to `http://localhost:5173` in your browser to view the application!

---

## 🐳 Docker Deployment (Production Ready)

If you prefer to run the entire stack seamlessly encapsulated using Docker, a complete `docker-compose.yml` file is provided at the root of the project. This will set up an internal MongoDB instance and bind the backend and properly Nginx-configured frontend.

Simply run:
```bash
docker-compose up --build -d
```
- The frontend will be accessible at **http://localhost:3000** (or `http://localhost:5173` if mapped locally).
- The backend API will be accessible at **http://localhost:5000**.
- The isolated MongoDB instance will be automatically spun up and connected.

---

## 🛡️ Access Control Breakdown

Understanding the RBAC hierarchy dictates what you experience when logged in:
- **If you log in as Admin**: You will view the entire user table. You have the ability to click *Add User*, *Edit* any User or Manager, and *Delete* any User or Manager. You cannot delete yourself.
- **If you log in as Manager**: You maintain viewing privileges over the table, however, your *Add User* and *Delete* buttons are hidden. You are uniquely permitted to click *Edit* only on purely "User" level accounts.
- **If you log in as User**: You bypass the dashboard altogether and interact purely with your own secure `Profile`.
