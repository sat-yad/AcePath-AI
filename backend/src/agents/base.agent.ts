import OpenAI from 'openai';
import { query } from '../db/client';
import { AgentInput, AgentOutput } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export abstract class BaseAgent {
  protected agentType: string;
  protected model: string;

  constructor(agentType: string, model = 'gpt-4o') {
    this.agentType = agentType;
    this.model = model;
  }

  abstract run(input: AgentInput): Promise<AgentOutput>;

  protected async chat(
    systemPrompt: string,
    userMessage: string,
    temperature = 0.7
  ): Promise<{ content: string; tokensUsed: number }> {
    if (process.env.USE_MOCK_AI === 'true') {
      console.warn(`[${this.agentType}] Using Mock AI mode for chat`);
      throw new Error("Mock mode enabled");
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature,
        response_format: { type: 'json_object' } as any,
      });
      return {
        content: response.choices[0].message.content || '{}',
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (err: any) {
      console.error(`[${this.agentType}] OpenAI API error:`, err?.message || err);
      throw err;
    }
  }

  protected async storeMemory(userId: string, content: string): Promise<void> {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content,
      });
      const embedding = embeddingResponse.data[0].embedding;
      await query(
        `INSERT INTO chat_memory (user_id, agent_type, content, embedding, metadata)
         VALUES ($1, $2, $3, $4::vector, $5)`,
        [userId, this.agentType, content, JSON.stringify(embedding), JSON.stringify({ timestamp: new Date() })]
      );
    } catch (err) {
      console.error(`[${this.agentType}] Memory store failed:`, err);
    }
  }

  protected async retrieveMemory(userId: string, query_text: string, limit = 5): Promise<string[]> {
    if (process.env.USE_MOCK_AI === 'true') {
       return [];
    }
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query_text,
      });
      const embedding = embeddingResponse.data[0].embedding;
      const result = await query(
        `SELECT content FROM chat_memory
         WHERE user_id = $1 AND agent_type = $2
         ORDER BY embedding <=> $3::vector
         LIMIT $4`,
        [userId, this.agentType, JSON.stringify(embedding), limit]
      );
      return result.rows.map((r) => r.content);
    } catch (err: any) {
      console.error(`[${this.agentType}] Memory retrieval failed:`, err?.message || err);
      return [];
    }
  }

  protected parseJSON(content: string): Record<string, unknown> {
    try {
      return JSON.parse(content);
    } catch {
      console.error(`[${this.agentType}] JSON parse error:`, content);
      return {};
    }
  }
}

export { openai };
