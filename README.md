<div align="center">
  <img src="client/public/favicon.svg" alt="ForgeSite AI Logo" width="100" />
  <h1>🚀 ForgeSite AI</h1>
  <p><strong>Turn your thoughts into complete, responsive websites instantly with AI.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  </p>
</div>

---

## 🌟 About the Project

**ForgeSite AI** is a powerful full-stack website builder designed to eliminate the friction between an idea and a live webpage. By simply typing a prompt, users can generate a fully functional, mobile-responsive, single-page website powered by Tailwind CSS and modern AI models. 

Users can seamlessly refine their generated sites through conversational revisions, track versions to easily rollback mistakes, and securely purchase credits for continued usage.

---

## ✨ Features

- **🧠 AI-Powered Generation:** Type a description and watch your website come to life in seconds.
- **🔄 Conversational Revisions:** Ask the AI to change colors, add sections, or tweak the layout.
- **🕰️ Version Control:** Automatic snapshots allow you to roll back to any previous version effortlessly.
- **👁️ Live Preview:** Real-time side-by-side view of the generated code and the rendered website.
- **🌐 Community Showcase:** Publish your best designs to the community feed.
- **💳 Credit System:** Integrated Stripe billing for purchasing AI credits securely.
- **🔒 Secure Authentication:** Handled seamlessly via Better-Auth.

---

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM v7
- **UI Components:** Shadcn UI, Better-Auth UI, Lucide React (Icons)
- **State/Notifications:** Sonner (Toasts), Axios (API Client)

### **Backend (Server)**
- **Framework:** Node.js + Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Authentication:** Better-Auth
- **AI Integration:** OpenRouter API (`z-ai/glm-5.2:free`)
- **Payments:** Stripe API & Webhooks

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed and set up:
- **Node.js** (v18 or higher)
- **PostgreSQL** Database (e.g., [Neon.tech](https://neon.tech))
- **OpenRouter Account** (for your AI API Key)
- **Stripe Account** (for payment integration)

### Environment Variables

Before running the project, you need to configure your environment variables.

#### Backend (`server/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `3000`) |
| `NODE_ENV` | Set to `development` locally |
| `TRUSTED_ORIGINS` | Your frontend URL (e.g., `http://localhost:5173`) |
| `BETTER_AUTH_URL` | Your backend URL (e.g., `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | A secure random string for authentication |
| `DATABASE_URL` | Your PostgreSQL connection string |
| `AI_API_KEY` | Your OpenRouter API Key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook signing secret |

#### Frontend (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_BASEURL` | Your backend API URL (e.g., `http://localhost:3000`) |


### Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/forgesite-ai.git
cd forgesite-ai
```

**2. Setup the Backend**
```bash
cd server
npm install

# Run database migrations and generate Prisma client
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

**3. Setup the Frontend**
Open a new terminal window:
```bash
cd client
npm install

# Start the frontend development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## 📦 Deployment

The repository is structured to be easily deployed for **free** on platforms like Render and Vercel.

1. **Backend (Render):** 
   - Deploy the `server` directory as a Node Web Service. 
   - Set Build Command: `npm install && npm run build`
   - Set Start Command: `npm run start`
2. **Frontend (Vercel):** 
   - Deploy the `client` directory.
   - Vite is automatically detected. Vercel will use the provided `vercel.json` for SPA rewrites to ensure routing works perfectly.

*Remember to update your environment variables in both platforms (specifically `TRUSTED_ORIGINS`, `BETTER_AUTH_URL`, and Stripe webhook URLs).*

---

## 📜 License

This project is licensed under the ISC License.
