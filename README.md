# SvelteKit Auth App (AuthKit)

[![CI](https://github.com/aroobarauf454/assignment-2/actions/workflows/ci.yml/badge.svg)](https://github.com/aroobarauf454/assignment-2/actions/workflows/ci.yml)

A full-stack authentication application built with SvelteKit (Svelte 5), Auth.js, TailwindCSS, PostgreSQL, Drizzle ORM, and an AI Chat interface powered by Google Gemini.

## Features

- Email/password registration and login
- OAuth authentication (Google & GitHub)
- Email verification with secure tokens
- Password reset / forgot password flow
- Protected routes with auth guards
- User profile management
- Dashboard with app statistics
- Admin dashboard with user management, analytics, and controls
- AI Chat interface (Vercel AI SDK + Gemini) with streaming responses
- Tree-structured chat history — fork conversations from any message with branch navigation
- Chat history stored per user in PostgreSQL
- Responsive UI with TailwindCSS
- Database sessions with Drizzle ORM + PostgreSQL

## Tech Stack

| Component | Technology |
|---|---|
| Frontend Framework | SvelteKit with Svelte 5 |
| Authentication | Auth.js (@auth/sveltekit) |
| Styling | TailwindCSS v4 |
| Database | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM |
| AI | Vercel AI SDK + Google Gemini |
| Language | TypeScript |

## Prerequisites

- Node.js v18+
- [Docker](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)
- pnpm (`npm install -g pnpm`)

## Quick Start (Fresh-Clone Setup)

```sh
# 1. Clone the repository
git clone <repo-url>
cd sveltekit-auth-app

# 2. Copy environment variables and fill in your secrets
cp .env.example .env

# 3. Start PostgreSQL via Docker
pnpm db:start

# 4. Install dependencies
pnpm install

# 5. Push database schema to PostgreSQL
pnpm db:push

# 6. Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (default: `postgresql://postgres:1234@localhost:5432/sveltekit_auth`) |
| `AUTH_SECRET` | Generate with `openssl rand -hex 32` |
| `AUTH_TRUST_HOST` | Set to `true` for local development |
| `AUTH_GOOGLE_ID` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GOOGLE_SECRET` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GITHUB_ID` | From [GitHub Developer Settings](https://github.com/settings/developers) |
| `AUTH_GITHUB_SECRET` | From [GitHub Developer Settings](https://github.com/settings/developers) |
| `SMTP_HOST` | SMTP server host (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP server port (e.g., `587`) |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASSWORD` | SMTP app-specific password |
| `EMAIL_FROM` | Sender email address |
| `ORIGIN` | App URL (default: `http://localhost:5173`) |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey) |

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check` | Run svelte-check |
| `pnpm db:start` | Start PostgreSQL Docker container |
| `pnpm db:stop` | Stop PostgreSQL Docker container |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:studio` | Open Drizzle Studio (DB GUI) |

## Project Structure

```
src/
├── lib/
│   ├── auth.ts                   # Auth.js configuration (with role in session)
│   ├── index.ts                  # Lib barrel export
│   ├── components/
│   │   ├── ChatMessage.svelte    # Reusable chat message bubble
│   │   ├── Logo.svelte           # Reusable SVG shield logo (AuthKit branding)
│   │   ├── Navbar.svelte         # Navigation bar (with admin/chat links)
│   │   └── OAuthButtons.svelte   # Google & GitHub sign-in buttons
│   └── server/
│       ├── email.ts              # Email sending utility (SMTP)
│       ├── token.ts              # Secure token generation
│       └── db/
│           ├── index.ts          # Drizzle client
│           └── schema.ts         # Database schema (users, accounts, sessions, tokens, chat)
├── routes/
│   ├── +layout.svelte            # Root layout with Navbar
│   ├── +layout.server.ts         # Session loader
│   ├── +page.svelte              # Animated landing page
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # Protected dashboard
│   ├── profile/                  # Protected profile page
│   ├── admin/                    # Admin dashboard (role-gated)
│   ├── chat/                     # AI Chat interface
│   ├── api/chat/                 # Gemini AI streaming endpoint
│   └── auth/
│       ├── forgot-password/      # Forgot password page
│       ├── reset-password/       # Reset password page
│       └── verify-email/         # Email verification
├── hooks.server.ts               # Auth.js request handler
├── app.css                       # TailwindCSS + custom animations
├── app.d.ts                      # TypeScript declarations
└── app.html                      # HTML template

drizzle.config.ts                 # Drizzle ORM configuration
```

## Database Schema

Defined in `src/lib/server/db/schema.ts` using Drizzle ORM:

| Table | Purpose |
|---|---|
| `users` | User accounts (id, name, email, hashed password, role, disabled status) |
| `accounts` | OAuth provider links (Google, GitHub) tied to users |
| `sessions` | Active session tokens with expiry |
| `verification_tokens` | Tokens for email verification and password reset |
| `chats` | Chat conversations per user (title, timestamps) |
| `chat_messages` | Chat messages in tree structure (role, content, parentId for branching) |

## Troubleshooting

- **Port 5432 already in use**: Stop any existing PostgreSQL service, or run `pnpm db:stop` then `pnpm db:start`
- **Docker not running**: Make sure Docker Desktop is open and running before `pnpm db:start`
- **Schema push fails**: Ensure the database container is running (`docker ps`) and `DATABASE_URL` in `.env` is correct
- **OAuth not working**: Verify your Google/GitHub OAuth credentials and that redirect URIs are set to `http://localhost:5173/auth/callback/google` and `http://localhost:5173/auth/callback/github`
- **AI Chat not working**: Ensure `GEMINI_API_KEY` is set in your `.env` file
