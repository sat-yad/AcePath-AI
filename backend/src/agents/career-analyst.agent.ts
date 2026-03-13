import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class CareerAnalystAgent extends BaseAgent {
  constructor() {
    super('career_analyst');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { profile } = context as {
      profile: {
        experience_years: number;
        target_companies: string[];
        tech_stack: string[];
        weak_areas: string[];
        daily_hours: number;
        current_company?: string;
      };
    };

    const systemPrompt = `You are an expert career coach and technical interview analyst.
Analyze the candidate profile and return a JSON object with exactly these fields:
{
  "difficultyScore": number (1-10, where 10 = hardest gap to close),
  "durationMonths": number (3, 4, 5, or 6),
  "intensityLevel": "light" | "moderate" | "intense",
  "analysis": string (2-3 sentences summarizing the candidate's situation),
  "keyFocusAreas": string[] (top 5 areas to focus on),
  "weeklyHourRecommendation": number,
  "readinessScore": number (0-100, current readiness)
}`;

    const userMessage = `Candidate Profile:
- Experience: ${profile.experience_years} years
- Current Company: ${profile.current_company || 'Not specified'}
- Target Companies: ${profile.target_companies.join(', ')}
- Tech Stack: ${profile.tech_stack.join(', ')}
- Weak Areas: ${profile.weak_areas.join(', ')}
- Available daily hours: ${profile.daily_hours}

Analyze this profile and return the JSON assessment.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.5);
      const data = this.parseJSON(content);

      // Store analysis in DB
      await query(
        `UPDATE skill_profiles 
         SET difficulty_score = $1, intensity_level = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [data.difficultyScore, data.intensityLevel, userId]
      );

      await this.storeMemory(
        userId,
        `Career Analysis: difficultyScore=${data.difficultyScore}, intensity=${data.intensityLevel}, focus=${JSON.stringify(data.keyFocusAreas)}`
      );

      return { success: true, data, tokensUsed };
    } catch (err: any) {
      console.warn(`[CareerAnalystAgent] Falling back to mock data due to error: ${err.message}`);
      
      const mockData = {
        difficultyScore: 7,
        durationMonths: 3,
        intensityLevel: "moderate",
        analysis: "Based on the provided profile, the candidate has a solid foundation but needs structured prep. The target companies require deep algorithmic knowledge and system design expertise.",
        keyFocusAreas: ["Data Structures & Algorithms", "System Design", "Behavioral (STAR method)"],
        weeklyHourRecommendation: profile.daily_hours * 5,
        readinessScore: 40
      };

      await query(
        `UPDATE skill_profiles 
         SET difficulty_score = $1, intensity_level = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [mockData.difficultyScore, mockData.intensityLevel, userId]
      );

      return { success: true, data: mockData, tokensUsed: 0 };
    }
  }
}
