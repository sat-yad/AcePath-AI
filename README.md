<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="80" alt="Next.js" />
  <h1>🚀 AcePath AI</h1>
  <p><strong>Autonomous Interview & Career Growth Coach</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🌟 Overview
**AcePath AI** is a next-generation career acceleration platform designed to help software engineers land their dream roles. By combining personalized learning roadmaps, AI-driven mock interviews, and advanced resume optimization, AcePath acts as a complete, autonomous career coach.

From Zero to **L6 Mastery**—AcePath synthesizes market data and your personal skill profile to build a precise, evolving growth cycle.

---

## ✨ Key Features

### 🗺️ AI Roadmap Planner
- Generates a personalized 24-week growth cycle based on your target companies (Google, Meta, Stripe) and current skill gaps.
- dynamic weekly plans, daily tasks, and milestone tracking.
- Visual timeline charting your progress from fundamentals to advanced architecture.

### 🗣️ Mock Interviewer
- Realistic chat simulations that probe your deep technical knowledge.
- Covers multiple domains: **System Design, DSA & Algorithms, Behavioral (STAR), and HR/Culture**.
- Provides instant, granular feedback, code evaluation, and scoring on your communication and correctness.

### 💎 Resume Architect
- AI-driven rewrite system that transforms your experience into high-conversion, ATS-optimized descriptions.
- Employs the STAR (Situation, Task, Action, Result) method to maximize impact.
- Provides before-and-after comparisons and detailed improvement analytics.

### 📊 Advanced Analytics Dashboard
- **Skill Priority Matrix:** Visualizes your strengths and weaknesses to prioritize learning efficiency.
- **Progress Tracking:** Monitors your daily streaks, completed tasks, and upcoming milestones.
- **Leaderboard:** Compares your dedication directly against the community.

---

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Next.js 14** (App Router)
- **React.js**
- **Tailwind CSS** (for styling and fluid animations)
- **Axios** (for API communication)
- **Lucide React** (for crisp iconography)

### Backend (API & Engine)
- **Node.js & Express.js**
- **TypeScript**
- **PostgreSQL (Supabase)** (with `pgvector` for chat memory embeddings)
- **OpenAI API** (GPT-4 for dynamic generation and evaluation)
- **Passport.js** (Google OAuth 2.0 & JWT Authentication)

---

## 🚀 Getting Started

Follow these steps to run the complete AcePath platform locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database (or a free Supabase project)
- OpenAI API Key
- Google Cloud Console Project (for OAuth Client ID)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/acepath.git
cd acepath
```

### 2. Setup the Backend
Navigate to the backend directory, install dependencies, and configure your environment.
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgres://[user]:[password]@[host]:[port]/[db_name]
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run the database migration scripts located in `backend/src/db/schema.sql` against your PostgreSQL/Supabase database to create the necessary tables.

Start the backend development server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal, navigate to the frontend directory, install dependencies, and configure the environment.
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Blast Off 🚀
Open your browser and navigate to `http://localhost:3000`. You should see the AcePath AI landing page!

---

## 📐 Architecture & Database

AcePath utilizes a robust relational database schema to manage user progression autonomously.
- **`users`**: Core account and authentication data.
- **`skill_profiles`**: Deep mapping of a user’s tech stack, experience, and target roles.
- **`roadmaps` & `weekly_plans` & `daily_tasks`**: Hierarchical task generation engine.
- **`mock_interviews`**: Transcripts, evaluations, and scoring for practice sessions.
- **`chat_memory`**: A vector store using `pgvector` for conversational awareness and RAG (Retrieval-Augmented Generation) context.

---

<div align="center">
  <p>Built with ❤️ for Software Engineers everywhere.</p>
  <p>© 2026 ACEPATH LABS</p>
</div>
