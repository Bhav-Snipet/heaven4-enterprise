# Heaven4 Enterprise
### Intelligent Restaurant Operations Platform (IROP)

> Production-grade hospitality operations platform built with Java 21 + Spring Boot 3.5 + React + TypeScript + PostgreSQL.

---

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js LTS (20+)
- PostgreSQL 15+ (DB: `heaven4`, user: `postgres`, password: `password`)

### Backend
```bash
cd heaven4-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# Opens on http://localhost:8085
# Swagger: http://localhost:8085/swagger-ui.html
```

### Frontend
```bash
cd heaven4-frontend
npm install
npm run dev
# Opens on http://localhost:5173
```

### Docker (PostgreSQL only)
```bash
docker-compose up -d postgres
```

---

## Architecture

- **Backend:** Java 21 · Spring Boot 3.5 · Spring Security · JPA/Hibernate · Flyway · WebSocket · OpenAPI
- **Frontend:** React 18 · TypeScript 5 · Vite · Tailwind CSS · TanStack Query · Framer Motion · shadcn/ui
- **Database:** PostgreSQL 15 (Flyway migrations)
- **Port:** 8085

## Roles
Customer · Employee · Kitchen/Chef · Bartender · Manager · Admin · Owner

## Platform Engines
Authentication · Workflow · Pricing · Membership · Payment · Approval · Task · Notification · Dashboard · Feature · Timeline · Metrics · Rule Simulator · Health · Smart Operations · Recommendation · Asset · Reporting · Automation

---

## Project Structure
```
heaven4/
├── heaven4-backend/   Spring Boot application
├── heaven4-frontend/  React application
├── database/          Additional SQL scripts & docs
├── docs/              Engineering Bible
├── postman/           API collection
├── scripts/           Dev scripts
├── docker/            Docker configurations
└── docker-compose.yml PostgreSQL local dev
```

## Milestones
- `v0.1.0` — Platform Foundation ← **current**
- `v0.2.0` — Identity & Authentication
- `v0.3.0` — Restaurant Core
- `v0.4.0` — Ordering
- `v0.5.0` — Billing & Rewards
- `v0.6.0` — Operations
- `v1.0.0` — Production

---

*Heaven4 is not a restaurant website. It is an Intelligent Restaurant Operations Platform.*
