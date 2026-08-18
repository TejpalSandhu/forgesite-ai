# 🚀 ForgeSite AI

ForgeSite AI is a full-stack, AI-powered website builder that allows users to turn their thoughts into complete, responsive websites instantly. Built with modern web technologies, it features a credit-based system, AI-driven code generation, live previews, and website revision tracking.

---

## ✨ Features

- **AI-Powered Website Generation:** Generate complete, single-page websites just by typing a description.
- **Iterative Revisions:** Refine and update the generated website through conversational prompts.
- **Version Control:** Automatic versioning allows you to roll back to any previous state of your website.
- **Live Preview:** Real-time preview of the generated HTML/TailwindCSS code.
- **Community Showcase:** Publish your creations for others to see in the community section.
- **Credit-Based System:** Secure credit purchasing system powered by Stripe.
- **Authentication:** Secure user authentication using Better-Auth.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM v7
- **UI Components:** Shadcn UI, Better-Auth UI, Lucide Icons
- **State/Requests:** Axios, Sonner (Toasts)

### Backend (Server)
- **Framework:** Node.js + Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Authentication:** Better-Auth
- **AI Integration:** OpenRouter API (`z-ai/glm-5.2:free` model)
- **Payments:** Stripe API & Webhooks

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g., Neon.tech)
- OpenRouter API Key
- Stripe Account (for payments)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/forgesite-ai.git
cd forgesite-ai
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=3000
NODE_ENV=development

# Frontend URL
TRUSTED_ORIGINS=http://localhost:5173
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_super_secret_string

# Database
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# AI & Payments
AI_API_KEY=your_openrouter_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

Run database migrations and start the server:
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_BASEURL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

---

## 📦 Deployment Guide

The project is configured to be easily deployed for **free** using Vercel (Frontend) and Render (Backend).

### Backend (Render)
1. Push your code to GitHub.
2. Create a new **Web Service** on Render pointing to the `server` directory.
3. Set the build command to `npm install && npm run build` and start command to `npm run start`.
4. Add all environment variables (update `TRUSTED_ORIGINS` to your Vercel URL and `BETTER_AUTH_URL` to your Render URL).

### Frontend (Vercel)
1. Import the repository in Vercel.
2. Set the Root Directory to `client`.
3. Add the `VITE_BASEURL` environment variable pointing to your Render backend URL.
4. Deploy (the `vercel.json` file handles SPA routing automatically).

> **Note:** Don't forget to update your Stripe Webhook endpoint with your live backend URL!

---

## 📜 License

This project is licensed under the ISC License.
