import { CareerAnalystAgent } from '../agents/career-analyst.agent';
import { db } from '../db/client';
import OpenAI from 'openai';

jest.mock('../db/client', () => ({
  db: {
    query: jest.fn(),
  },
}));

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                difficulty: 7.5,
                focusAreas: ['System Design', 'Concurrency'],
                estimatedDurationMonths: 4,
                dailyIntensityHours: 3,
              }),
            },
          }],
        }),
      },
    },
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      }),
    },
  }));
});

describe('CareerAnalystAgent', () => {
  let agent: CareerAnalystAgent;

  beforeEach(() => {
    agent = new CareerAnalystAgent();
  });

  it('should analyze profile and return structured results', async () => {
    const input = {
      userId: 'test-user-id',
      experienceYears: 5,
      targetCompanies: ['Google'],
      techStack: ['TS', 'Node'],
      weakAreas: ['System Design'],
    };

    const result = await agent.analyzeProfile(input);

    expect(result).toHaveProperty('difficulty');
    expect(result.difficulty).toBe(7.5);
    expect(result.focusAreas).toContain('System Design');
    expect(db.query).toHaveBeenCalled();
  });
});
