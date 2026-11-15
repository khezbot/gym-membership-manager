# Gym Membership Manager

A MERN (MongoDB, Express, React, Node.js) web app that lets gym **members** browse membership plans and request to join one, and lets gym **admins** (staff) manage plans and approve or reject requests. Built for IFQ636 Assignment 1 by extending the [IFQ636 starter project](https://github.com/nahaQUT/sampleapp_IFQ636).

- **Live URL:** http://54.206.121.20/
- **Release:** `v1.0.0`
- **Jira:** https://shayanknassab.atlassian.net/jira/software/projects/GMM/boards/2
- **Figma:** FIGMA_VIEW_LINK

## Features

| Role | What they can do |
|------|------------------|
| Member | Register / log in, browse active plans, request a plan with a start date, see request status (pending / active / rejected / cancelled), cancel a pending or active membership, edit profile |
| Admin | Log in, create / edit / deactivate / delete plans, view requests filtered by status, approve (end date is calculated) or reject (reason required) |

**Two end-to-end workflows**
1. *Join a plan (main, deployed workflow):* member requests plan → admin approves or rejects → member sees result.
2. *Manage plans:* admin creates plan → plan appears for members → admin edits / deactivates / deletes it.

**Business rules:** one open (pending or active) membership per member; a plan with open memberships can't be deleted (deactivate it instead); plan names are unique (create and rename); start date must be today to 60 days ahead; rejecting needs a reason; nobody can self-register as admin.

## Architecture

```
Browser (React SPA)
   │  HTTP :80
   ▼
Nginx (EC2) ──/api/*──► Express API :5001 (pm2 "backend") ──► MongoDB Atlas
   └──── /* ─────────► React build :3000 (pm2 "frontend")
```

- `backend/` – Express REST API. `models/` (User, Plan, Membership), `controllers/`, `routes/`, `middleware/authMiddleware.js` (`protect` = JWT check, `authorize(role)` = role check), `utils/validation.js`.
- `frontend/` – React 18 + Tailwind. `pages/` (member pages and `pages/admin/`), `components/ui.jsx` (shared Button, Field, Alert, EmptyState, StatusBadge), `ProtectedRoute.jsx`.
- The frontend calls the API on the same origin (`/api/...`), so the server IP is never hard-coded and only port 80 is public.

### API

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | Create member account |
| POST | /api/auth/login | public | Log in, returns JWT + role |
| GET/PUT | /api/auth/profile | any | View / update own profile |
| GET | /api/plans | any | List plans (members: active only) |
| POST | /api/plans | admin | Create plan |
| PUT | /api/plans/:id | admin | Update / (de)activate plan |
| DELETE | /api/plans/:id | admin | Delete plan (blocked if in use) |
| POST | /api/memberships | member | Request a plan |
| GET | /api/memberships/mine | member | Own memberships |
| PATCH | /api/memberships/:id/cancel | member | Cancel own membership |
| GET | /api/memberships?status= | admin | All requests |
| PATCH | /api/memberships/:id/review | admin | Approve / reject |

## Local setup

Requires Node.js 22 (as used by the unit's CI pipeline) and a MongoDB Atlas connection string.

```bash
git clone https://github.com/khezbot/gym-membership-manager.git && cd gym-membership-manager
npm run install-all
cp backend/.env.example backend/.env    # then edit MONGO_URI, JWT_SECRET, ADMIN_* values
npm run seed --prefix backend           # creates the admin account + 3 sample plans
npm run dev                             # API on :5001, React on :3000
npm test                                # 18 backend unit tests (Mocha/Chai/Sinon)
```

Log in at http://localhost:3000 with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` for the admin view, or register a new account for the member view.

## Deployment (manual, EC2)

Deployed to the university-provided EC2 instance (Ubuntu 24.04, t2.micro, Asia Pacific (Sydney), IAM profile `IFQ636-EC2-Role`, public subnet). Step-by-step commands are in [`deploy/DEPLOY.md`](deploy/DEPLOY.md). Summary: clone repo → create `backend/.env` on the server → `pm2` runs the backend and the built frontend → Nginx (config in `deploy/nginx-default.conf`) proxies port 80.

**Security:** `.env` is git-ignored and only exists on the server; the starter's sample JWT secret was replaced; inbound rules allow HTTP 80 from anywhere and SSH 22 from the developer's IP only (port 5001 is not exposed); passwords are hashed with bcrypt; roles are checked on the server for every protected route.

## Known limitations

- No online payment: payment is taken at the front desk after approval.
- Memberships don't expire automatically; status stays `active` after the end date (a scheduled job is a planned improvement).
- HTTP only (no HTTPS/domain) on the university instance.
- The instance has no Elastic IP, so its public IP changes if it is stopped and started; the Live URL above is updated when that happens.
- JWT is stored in `localStorage`; an httpOnly cookie would be safer.
- No password reset or email notifications.
- One admin role only (no separate manager/trainer roles).
- MongoDB Atlas network access is open to all IPs (0.0.0.0/0) so the laptop and EC2 can both connect; access is protected by the database user's credentials, which exist only in `.env`.
- `npm audit` reports vulnerabilities in the starter's frontend tooling (react-scripts); upgrading is future work.
