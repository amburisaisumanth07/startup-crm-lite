# Luminate CRM 🌟

<div align="center">
  <img src="https://via.placeholder.com/150x150?text=Luminate+CRM+Logo" alt="Luminate CRM Logo" width="150" />
  <p><strong>The modern, lightweight, and luxury CRM tailored for startups and visionary teams.</strong></p>
</div>

---

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Vision & Objectives](#-vision--objectives)
4. [Key Features](#-key-features)
5. [Target Users & Use Cases](#-target-users--use-cases)
6. [System Architecture](#-system-architecture)
7. [Technology Stack](#-technology-stack)
8. [Project Folder Structure](#-project-folder-structure)
9. [Development Setup & Installation](#-development-setup--installation)
10. [Environment Variables](#-environment-variables)
11. [Running the Project](#-running-the-project)
12. [Deployment Guide](#-deployment-guide)
13. [Testing & Quality Assurance](#-testing--quality-assurance)
14. [Coding Standards & Contribution](#-coding-standards--contribution)
15. [Security & Performance](#-security--performance)
16. [Future Roadmap](#-future-roadmap)
17. [License](#-license)

---

## 🌟 Project Overview

**Luminate CRM** is a production-grade, full-stack Customer Relationship Management platform. Designed specifically for high-growth startups, it provides a seamless, premium, and lightning-fast interface to manage inbound leads, track sales velocity, and analyze pipeline performance. 

Boasting a bespoke "Luxury Black & Gold" theme, Luminate brings an elegant, enterprise-level aesthetic to standard data management, offering both breathtaking design and uncompromised performance.

---

## 🎯 Problem Statement

Traditional CRMs are either prohibitively expensive, agonizingly slow, or visually outdated. High-growth startups need a platform that is quick to deploy, intuitive to navigate, and visually inspiring to their sales and management teams, without the bloat of unnecessary legacy features.

---

## 🚀 Vision & Objectives

To deliver a **streamlined, visually stunning, and highly performant** CRM that empowers sales teams to ingest, track, and close deals effortlessly while providing executive teams with real-time, actionable analytics.

- **Speed:** Instantaneous interactions via Optimistic UI updates.
- **Aesthetics:** A meticulously crafted "Luxury Black & Gold" UI that teams actually enjoy using.
- **Simplicity:** Zero learning curve; essential features prioritized over clutter.

---

## ✨ Key Features

- **Advanced Dashboard:** Real-time summary of sales velocity, pipeline efficiency, and active leads.
- **Lead Ledger:** Comprehensive, searchable, and sortable database of all prospects.
- **Visual Analytics:** Interactive, theme-aware Recharts integrations for Funnel analysis, Conversion trends, and Heatmaps.
- **Dark/Light Mode:** Seamless, CSS-variable-powered theme toggling ensuring optimal contrast and visual hierarchy.
- **Secure Authentication:** Robust JWT-based auth flows with hardened Express endpoints.
- **Optimistic UI:** Instant state updates backed by context-level syncing with the database.

---

## 👥 Target Users & Use Cases

- **Founders & CEOs:** Monitor pipeline health, revenue forecasts, and top performers.
- **Sales Representatives:** Ingest leads, update deal statuses, and manage contact data.
- **Revenue Operations:** Analyze drop-off rates and lead source distribution.

---

## 🏗 System Architecture

### High-Level Architecture Overview

Luminate CRM is a **Single Page Application (SPA)** decoupled from a **RESTful API backend**. 

1. **Client Tier:** React 19 SPA served via Vite. Handles routing (React Router), state (React Context), and rendering.
2. **API Tier:** Node.js/Express REST API processing business logic, authentication, and validation.
3. **Data Tier:** MongoDB document database managed via Mongoose schemas.

### Authentication & Authorization

- **Strategy:** JSON Web Tokens (JWT).
- **Flow:** User authenticates via `/api/auth/login` → Server returns signed JWT → Client stores JWT securely and attaches it to the `Authorization: Bearer` header for all subsequent protected API calls.

### State Management

- Luminate utilizes the **React Context API** for global state.
- Distinct domains are isolated: `AuthContext` (User session), `LeadContext` (CRM Data), `ThemeContext` (UI Mode), and `FilterContext` (Search/Sort memory).

---

## 💻 Technology Stack

### Frontend (Client)
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Custom Luxury Token System)
- **Routing:** React Router v7
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend (Server)
- **Runtime:** Node.js (v20+)
- **Framework:** Express 5
- **Database:** MongoDB
- **ORM:** Mongoose 9
- **Security:** Helmet, Express-Rate-Limit, Mongo Sanitize, bcryptjs
- **Auth:** jsonwebtoken (JWT)

---

## 📁 Project Folder Structure

```text
startup-crm-lite/
├── backend/                  # RESTful API Server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Business logic for endpoints (e.g., authController.js)
│   ├── middleware/           # Security, auth, and validation middleware
│   ├── models/               # Mongoose DB Schemas (User, Lead)
│   ├── routes/               # Express route definitions
│   ├── utils/                # Helper functions (e.g., error handlers)
│   ├── server.js             # API entry point & Express bootstrap
│   └── package.json          # Backend dependencies
│
├── src/                      # React Frontend SPA
│   ├── assets/               # Static images, fonts, and icons
│   ├── components/           # Reusable UI architecture
│   │   ├── analytics/        # Chart components (e.g., FunnelChartCard.jsx)
│   │   ├── common/           # Shared UI (Sidebar, Layout, SearchBar)
│   │   ├── dashboard/        # Dashboard widgets (PipelineOverview, RecentLeads)
│   │   ├── leads/            # Lead management UI (LeadCard, LeadTable, Form)
│   │   └── settings/         # Configuration UI components
│   ├── constants/            # Global constants (colors, config)
│   ├── context/              # React Context Providers (State Management)
│   ├── data/                 # Mock or seed data schemas
│   ├── hooks/                # Custom React Hooks (e.g., useChartTheme)
│   ├── pages/                # Top-level route components (Dashboard, Analytics, etc.)
│   ├── routes/               # Client-side route definitions
│   ├── services/             # API client wrappers (Axios instances)
│   ├── utils/                # Frontend helper formatting utilities
│   ├── App.jsx               # Root component wrapping contexts & routes
│   ├── index.css             # Global stylesheet & Tailwind @theme definitions
│   └── main.jsx              # DOM mounting point
│
├── .env                      # Global environment variables
├── eslint.config.js          # Linter configuration
├── package.json              # Workspace & Frontend dependencies
└── vite.config.js            # Vite bundler configuration
```

---

## 🛠 Development Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v20.0 or higher
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-org/startup-crm-lite.git
cd startup-crm-lite
```

### 2. Install Dependencies
Install frontend dependencies:
```bash
npm install
```
Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

---

## 🔐 Environment Variables

Create a `.env` file in the **backend** directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/crm

# Security & Authentication
JWT_SECRET=your_super_secret_jwt_signature_key
JWT_EXPIRE=30d
```

Create a `.env` file in the **root** directory (Frontend):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Project

### Development Mode

You will need two terminal windows to run both ends concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*API will start on `http://localhost:5000`*

**Terminal 2 (Frontend):**
```bash
npm run dev
```
*Vite dev server will start on `http://localhost:5173`*

---

## 📦 Build Process & Deployment Guide

### Production Build
To create a highly optimized production build of the frontend:
```bash
npm run build
```
This generates a `dist/` directory containing the static assets.

### Deployment Strategy
1. **Frontend (Vercel/Netlify):**
   - Connect the repository.
   - Set Build Command: `npm run build`
   - Set Publish Directory: `dist`
   - Add Environment Variable: `VITE_API_URL=https://api.yourdomain.com/api`

2. **Backend (Render/Railway/Heroku):**
   - Connect the repository and point to the `backend/` root.
   - Start Command: `npm start`
   - Add `.env` variables securely in the host dashboard.

---

## 🛡 Security Considerations

- **Helmet.js:** Secures Express apps by setting various HTTP headers.
- **Express-Rate-Limit:** Protects APIs against brute-force and DDoS attacks.
- **Mongo-Sanitize:** Prevents NoSQL injection attacks.
- **Bcrypt.js:** Hashes passwords with secure salting before DB persistence.
- **CORS:** Strictly configured to allow traffic only from trusted frontend domains.

---

## 🤝 Coding Standards & Contribution

1. **Architecture:** Keep UI components stateless where possible; derive state via Context.
2. **Styling:** Strictly adhere to the semantic brand tokens defined in `src/index.css`. Avoid hardcoded tailwind colors (`slate-500`, `blue-600`) to maintain theme integrity.
3. **Commit Convention:** Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).

### Submitting a Pull Request
1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Commit changes: `git commit -m "feat: added new feature"`
4. Push to branch: `git push origin feat/new-feature`
5. Open a Pull Request.

---

## 🔮 Future Roadmap

- [ ] **AI Integration:** Predictive lead scoring using historical conversion data.
- [ ] **Email Sync:** Two-way synchronization with Gmail/Outlook for communication logs.
- [ ] **Role-Based Access Control (RBAC):** Tiered permissions for Admins vs. Reps.
- [ ] **Webhooks:** Outbound hooks to integrate with Zapier and Make.com.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<div align="center">
  <p><i>Built with precision for the next generation of startups.</i></p>
</div>
