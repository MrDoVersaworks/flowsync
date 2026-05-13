import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDecryptedApiKey } from './settings.service';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { ErrorCode, DEFAULT_AI_MODEL } from '../constants';

export async function breakdownGoal(userId: string, goal: string): Promise<any[]> {
  // 1. Get user configuration
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'User not found' };
  }

  const user = userResult[0];
  const apiKey = await getDecryptedApiKey(userId);
  const modelName = user.gemini_model_config || DEFAULT_AI_MODEL;

  logger.info('AI', `Initiating breakdown for goal: "${goal}" using model: ${modelName}`);

  // 2. Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are a project management assistant. 
    Break down the following goal into 5 to 8 actionable, concise Kanban tasks.
    Goal: "${goal}"

    Return ONLY a JSON object with the following structure:
    {
      "tasks": [
        {
          "title": "Task title",
          "description": "Short 1-sentence description",
          "priority": "low" | "medium" | "high" | "urgent"
        }
      ]
    }
    No extra text, no markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown wrapping
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error('Invalid AI response format');
    }

    logger.info('AI', `Successfully generated ${parsed.tasks.length} sub-tasks for user: ${userId}`);
    return parsed.tasks;
  } catch (error: any) {
    logger.error('ERROR', `AI Breakdown failed for user: ${userId}`, error);
    throw { status: 500, code: ErrorCode.AI_SERVICE_ERROR, message: 'The AI service failed to process your goal. Please check your API key and model config.' };
  }
}
