-- ============================================================
-- AcePath AI — PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id     TEXT UNIQUE,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  tier          TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  stripe_customer_id TEXT,
  is_onboarded  BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. SKILL PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_years  INT NOT NULL DEFAULT 0,
  current_company   TEXT,
  target_companies  JSONB NOT NULL DEFAULT '[]',
  tech_stack        JSONB NOT NULL DEFAULT '[]',
  weak_areas        JSONB NOT NULL DEFAULT '[]',
  daily_hours       FLOAT NOT NULL DEFAULT 2,
  difficulty_score  FLOAT,
  intensity_level   TEXT CHECK (intensity_level IN ('light', 'moderate', 'intense')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX idx_skill_profiles_user_id ON skill_profiles(user_id);

-- ============================================================
-- 3. ROADMAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmaps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  duration_months INT NOT NULL DEFAULT 3,
  milestones      JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  start_date      DATE NOT NULL,
  target_end_date DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);

-- ============================================================
-- 4. WEEKLY PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id  UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  goals       JSONB NOT NULL DEFAULT '[]',
  topics      JSONB NOT NULL DEFAULT '[]',
  focus_area  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_weekly_plans_roadmap_id ON weekly_plans(roadmap_id);
CREATE INDEX idx_weekly_plans_user_id ON weekly_plans(user_id);

-- ============================================================
-- 5. DAILY TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekly_plan_id  UUID REFERENCES weekly_plans(id) ON DELETE SET NULL,
  date            DATE NOT NULL,
  tasks           JSONB NOT NULL DEFAULT '[]',
  generated_by    TEXT NOT NULL DEFAULT 'daily_planner_agent',
  total_tasks     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);

-- ============================================================
-- 6. TASK COMPLETION LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS task_completion_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_task_id UUID NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
  task_index   INT NOT NULL,
  task_type    TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_mins INT,
  score        FLOAT,
  notes        TEXT
);
CREATE INDEX idx_task_logs_user_id ON task_completion_logs(user_id);
CREATE INDEX idx_task_logs_date ON task_completion_logs(completed_at);

-- ============================================================
-- 7. MOCK INTERVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS mock_interviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('dsa', 'system_design', 'behavioral', 'hr', 'mixed')),
  questions   JSONB NOT NULL DEFAULT '[]',
  answers     JSONB NOT NULL DEFAULT '[]',
  feedback    JSONB NOT NULL DEFAULT '{}',
  overall_score FLOAT,
  duration_mins INT,
  status      TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_mock_interviews_user_id ON mock_interviews(user_id);
CREATE INDEX idx_mock_interviews_created_at ON mock_interviews(created_at);

-- ============================================================
-- 8. SKILL GAP REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_gap_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gaps            JSONB NOT NULL DEFAULT '[]',
  strengths       JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  readiness_score FLOAT,
  source          TEXT DEFAULT 'skill_gap_agent',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_skill_gap_reports_user_id ON skill_gap_reports(user_id);

-- ============================================================
-- 9. RESUME VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_versions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_text       TEXT,
  improved_text  TEXT,
  ats_score      FLOAT,
  suggestions    JSONB NOT NULL DEFAULT '[]',
  version_number INT NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resume_versions_user_id ON resume_versions(user_id);

-- ============================================================
-- 10. CHAT MEMORY (Vector Store)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_memory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_type  TEXT NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(1536),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_memory_user_id ON chat_memory(user_id);
CREATE INDEX idx_chat_memory_agent_type ON chat_memory(agent_type);
-- IVFFlat index for vector similarity search
CREATE INDEX idx_chat_memory_embedding ON chat_memory 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- ============================================================
-- 11. ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  metadata    JSONB DEFAULT '{}',
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- ============================================================
-- 13. STREAK TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- Triggers: auto update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_skill_profiles_updated_at BEFORE UPDATE ON skill_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_roadmaps_updated_at BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
