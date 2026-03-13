import { BaseAgent } from './base.agent';
import { AgentInput, AgentOutput } from '../types';
import { query } from '../db/client';

export class MockInterviewAgent extends BaseAgent {
  constructor() {
    super('mock_interview');
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const { userId, context } = input;
    const { action, interviewId, interviewType, skillProfile, question, answer, questionIndex } = context as {
      action: 'start' | 'evaluate' | 'finish';
      interviewId?: string;
      interviewType?: string;
      skillProfile?: { tech_stack: string[]; weak_areas: string[]; experience_years: number };
      question?: string;
      answer?: string;
      questionIndex?: number;
    };

    if (action === 'start') {
      return await this.startInterview(userId, interviewType!, skillProfile!);
    } else if (action === 'evaluate') {
      return await this.evaluateAnswer(userId, interviewId!, question!, answer!, questionIndex!);
    } else {
      return await this.finishInterview(userId, interviewId!);
    }
  }

  private async startInterview(
    userId: string,
    type: string,
    profile: { tech_stack: string[]; weak_areas: string[]; experience_years: number }
  ): Promise<AgentOutput> {
    const systemPrompt = `You are a senior technical interviewer at a top tech company.
Generate an interview session with 5 questions. Return ONLY JSON:
{
  "questions": [
    {
      "index": number,
      "question": string,
      "topic": string,
      "difficulty": "easy" | "medium" | "hard",
      "expectedKeyPoints": string[]
    }
  ],
  "interviewerIntro": string
}`;

    const userMessage = `Create a ${type} interview for:
- Experience: ${profile.experience_years} years
- Tech Stack: ${profile.tech_stack.join(', ')}
- Weak Areas: ${profile.weak_areas.join(', ')}
Generate 5 progressively challenging questions.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.8);
      const data = this.parseJSON(content);

      const result = await query(
        `INSERT INTO mock_interviews (user_id, type, questions, answers, feedback, status)
         VALUES ($1, $2, $3, $4, $5, 'in_progress') RETURNING id`,
        [userId, type, JSON.stringify(data.questions), '[]', '{}']
      );

      return { success: true, data: { ...data, interviewId: result.rows[0].id, type }, tokensUsed };
    } catch (err: any) {
      console.warn(`[MockInterviewAgent - start] Falling back to mock data due to error: ${err.message}`);
      return this.generateMockInterviewSession(userId, type);
    }
  }

  private async generateMockInterviewSession(userId: string, type: string): Promise<AgentOutput> {
    const mockQuestions = [
      {
        index: 0,
        question: "Can you describe a time you had to resolve a conflict within your team?",
        topic: "Conflict Resolution",
        difficulty: "medium",
        expectedKeyPoints: ["Active listening", "Compromise", "Focus on shared goals"]
      },
      {
        index: 1,
        question: "How do you ensure your code is scalable and maintainable?",
        topic: "Software Engineering Practices",
        difficulty: "medium",
        expectedKeyPoints: ["Design patterns", "Testing", "Documentation", "Modularity"]
      }
    ];

    const result = await query(
      `INSERT INTO mock_interviews (user_id, type, questions, answers, feedback, status)
       VALUES ($1, $2, $3, $4, $5, 'in_progress') RETURNING id`,
      [userId, type, JSON.stringify(mockQuestions), '[]', '{}']
    );

    return { 
      success: true, 
      data: { 
        questions: mockQuestions, 
        interviewerIntro: "Hi there! (Mock Mode) I'll be conducting your interview today. We'll go through a few standard questions.",
        interviewId: result.rows[0].id,
        type
      }, 
      tokensUsed: 0 
    };
  }

  private async evaluateAnswer(
    userId: string,
    interviewId: string,
    question: string,
    answer: string,
    questionIndex: number
  ): Promise<AgentOutput> {
    const systemPrompt = `You are a senior technical interviewer evaluating a candidate's answer.
Return ONLY JSON:
{
  "score": number (0-10),
  "correctness": number (0-10),
  "depth": number (0-10),
  "communicationClarity": number (0-10),
  "feedback": string,
  "strongPoints": string[],
  "improvements": string[],
  "idealAnswerHints": string[]
}`;

    const userMessage = `Question: ${question}
Candidate Answer: ${answer}
Evaluate this answer comprehensively.`;

    try {
      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.4);
      const evaluation = this.parseJSON(content);

      // Append answer + evaluation to interview record
      const existing = await query('SELECT answers FROM mock_interviews WHERE id = $1', [interviewId]);
      const answers = JSON.parse(existing.rows[0]?.answers || '[]');
      answers.push({ questionIndex, answer, score: evaluation.score, feedback: evaluation.feedback, evaluatedAt: new Date() });

      await query('UPDATE mock_interviews SET answers = $1 WHERE id = $2', [JSON.stringify(answers), interviewId]);

      await this.storeMemory(userId, `Interview answer Q${questionIndex} score: ${evaluation.score}/10. Feedback: ${evaluation.feedback}`);

      return { success: true, data: evaluation, tokensUsed };
    } catch (err: any) {
      console.warn(`[MockInterviewAgent - evaluate] Falling back to mock data due to error: ${err.message}`);
      const mockEvaluation = {
        score: 7,
        correctness: 7,
        depth: 6,
        communicationClarity: 8,
        feedback: "(Mock Data) That's a reasonable answer, but you could dive deeper into specific metrics or examples.",
        strongPoints: ["Clear communication", "Structured approach"],
        improvements: ["Provide more concrete examples", "Mention edge cases"],
        idealAnswerHints: ["Consider mentioning X, Y, or Z."]
      };
      
      const existing = await query('SELECT answers FROM mock_interviews WHERE id = $1', [interviewId]);
      const answers = JSON.parse(existing.rows[0]?.answers || '[]');
      answers.push({ questionIndex, answer, score: mockEvaluation.score, feedback: mockEvaluation.feedback, evaluatedAt: new Date() });
      await query('UPDATE mock_interviews SET answers = $1 WHERE id = $2', [JSON.stringify(answers), interviewId]);

      return { success: true, data: mockEvaluation, tokensUsed: 0 };
    }
  }

  private async finishInterview(userId: string, interviewId: string): Promise<AgentOutput> {
    const systemPrompt = `You are a senior technical interviewer. Based on the candidate's answers, provide a final comprehensive evaluation.
Return ONLY JSON:
{
  "overallScore": number (0-100),
  "overallComment": string,
  "strengths": string[],
  "improvements": string[],
  "skillScores": { "topic": score },
  "readinessLevel": "not_ready" | "needs_work" | "almost_ready" | "ready",
  "nextSteps": string[]
}`;

    try {
      const interview = await query(
        'SELECT questions, answers FROM mock_interviews WHERE id = $1',
        [interviewId]
      );
      const { questions, answers } = interview.rows[0];
      const userMessage = `Evaluate this completed interview session:
Questions: ${questions}
Answers: ${answers}
Provide the final comprehensive evaluation.`;

      const { content, tokensUsed } = await this.chat(systemPrompt, userMessage, 0.4);
      const data = this.parseJSON(content);

      await query(
        `UPDATE mock_interviews 
         SET feedback = $1, overall_score = $2, status = 'completed', completed_at = NOW()
         WHERE id = $3`,
        [JSON.stringify(data), data.overallScore, interviewId]
      );

      return { success: true, data, tokensUsed };
    } catch (err: any) {
      console.warn(`[MockInterviewAgent - finish] Falling back to mock data due to error: ${err.message}`);
      const mockFinal = {
        overallScore: 75,
        overallComment: "(Mock Data) Overall, you demonstrated a solid understanding of the basics. There is room to improve on advanced topics and providing specific, quantifiable examples during behavioral questions.",
        strengths: ["Communication", "Basic concepts"],
        improvements: ["Advanced system design", "STAR method structure"],
        skillScores: { "General": 75 },
        readinessLevel: "almost_ready",
        nextSteps: ["Practice more system design", "Review behavioral questions"]
      };

      await query(
        `UPDATE mock_interviews 
         SET feedback = $1, overall_score = $2, status = 'completed', completed_at = NOW()
         WHERE id = $3`,
        [JSON.stringify(mockFinal), mockFinal.overallScore, interviewId]
      );

      return { success: true, data: mockFinal, tokensUsed: 0 };
    }
  }
}
