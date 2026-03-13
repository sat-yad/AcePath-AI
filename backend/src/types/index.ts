// Shared TypeScript interfaces for AcePath AI backend

export type UserTier = 'free' | 'premium';
export type InterviewType = 'dsa' | 'system_design' | 'behavioral' | 'hr' | 'mixed';
export type IntensityLevel = 'light' | 'moderate' | 'intense';

export interface AppUser {
  id: string;
  email: string;
  password_hash?: string;
  google_id?: string;
  full_name: string;
  avatar_url?: string;
  tier: UserTier;
  stripe_customer_id?: string;
  is_onboarded: boolean;
  last_active_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SkillProfile {
  id: string;
  user_id: string;
  experience_years: number;
  current_company?: string;
  target_companies: string[];
  tech_stack: string[];
  weak_areas: string[];
  daily_hours: number;
  difficulty_score?: number;
  intensity_level?: IntensityLevel;
  created_at: Date;
  updated_at: Date;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  duration_months: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'paused';
  start_date: string;
  target_end_date: string;
  created_at: Date;
  updated_at: Date;
}

export interface Milestone {
  week: number;
  title: string;
  focusArea: string;
  skills: string[];
  mockInterviewScheduled: boolean;
}

export interface WeeklyPlan {
  id: string;
  roadmap_id: string;
  user_id: string;
  week_number: number;
  goals: string[];
  topics: string[];
  focus_area?: string;
  created_at: Date;
}

export interface DailyTask {
  id: string;
  user_id: string;
  weekly_plan_id?: string;
  date: string;
  tasks: TaskItem[];
  generated_by: string;
  total_tasks: number;
  created_at: Date;
}

export interface TaskItem {
  index: number;
  type: 'dsa' | 'system_design' | 'behavioral' | 'revision' | 'resume' | 'hr';
  title: string;
  description: string;
  estimatedMins: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  resourceLink?: string;
}

export interface MockInterview {
  id: string;
  user_id: string;
  type: InterviewType;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  feedback: InterviewFeedback;
  overall_score?: number;
  duration_mins?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: Date;
  completed_at?: Date;
}

export interface InterviewQuestion {
  index: number;
  question: string;
  topic: string;
  difficulty: string;
  expectedKeyPoints?: string[];
}

export interface InterviewAnswer {
  questionIndex: number;
  answer: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

export interface InterviewFeedback {
  overallComment: string;
  strengths: string[];
  improvements: string[];
  skillScores: Record<string, number>;
  nextSteps: string[];
}

export interface AgentInput {
  userId: string;
  context: Record<string, unknown>;
}

export interface AgentOutput {
  success: boolean;
  data: Record<string, unknown>;
  tokensUsed?: number;
  error?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  tier: UserTier;
}

import { Request } from 'express';

// Express request extension moved to express.d.ts
export interface AuthenticatedRequest extends Request {
  user: AppUser;
}
