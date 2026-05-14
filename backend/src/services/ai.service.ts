import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDecryptedApiKey } from './settings.service.js';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { ErrorCode, DEFAULT_AI_MODEL } from '../constants.js';

import { AITask } from '../types/ai.types.js';

import { tasks, columns } from '../db/schema.js';
import { io } from '../index.js';

export async function breakdownGoal(userId: string, workspaceId: string, goal: string): Promise<AITask[]> {
  // 1. Get user configuration
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'User not found' };
  }

  const user = userResult[0];
  const apiKey = await getDecryptedApiKey(userId);
  const modelName = user.gemini_model_config || DEFAULT_AI_MODEL;

  logger.info('AI', `Initiating breakdown for goal: "${goal}" in workspace: ${workspaceId}`);

  // 2. Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are a technical project orchestrator. 
    Break down the following goal into 5 to 8 actionable, technical Kanban tasks.
    Goal: "${goal}"

    Return ONLY a JSON object with the following structure:
    {
      "tasks": [
        {
          "title": "Task title",
          "description": "[AI] Short technical description",
          "priority": "low" | "medium" | "high" | "urgent"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error('Invalid AI response format');
    }

    // 3. Grounding: Find or Create 'Backlog' column
    let targetColumn = await db.select().from(columns)
      .where(eq(columns.workspace_id, workspaceId))
      .limit(1);
    
    let columnId: string;
    if (targetColumn.length === 0) {
      const newCol = await db.insert(columns).values({
        workspace_id: workspaceId,
        title: 'Backlog',
        position: 0
      }).returning();
      columnId = newCol[0].id;
    } else {
      columnId = targetColumn[0].id;
    }

    // 4. Infrastructure Inception: Bulk Insert Tasks
    const taskValues = parsed.tasks.map((t: any, index: number) => ({
      workspace_id: workspaceId,
      column_id: columnId,
      title: t.title,
      description: t.description,
      priority: t.priority,
      position: index,
      created_by: userId
    }));

    await db.insert(tasks).values(taskValues);

    // 5. Real-Time Convergence: Broadcast to Sanctuary
    io.to(workspaceId).emit('board-updated', { type: 'AI_INCEPTION', workspaceId });

    logger.info('AI', `Successfully orchestrated ${parsed.tasks.length} tasks for workspace: ${workspaceId}`);
    return parsed.tasks;
  } catch (error: any) {
    logger.error('ERROR', `AI Orchestration failed`, error);
    
    // Propagate specific Google AI errors if available
    const status = error.status || 500;
    let message = 'Orchestration failed. Please verify your AI configuration.';

    if (error.message?.includes('high demand') || error.status === 503) {
      message = 'Gemini is currently experiencing high demand. Please try again in a few moments.';
    } else if (error.message?.includes('API key') || error.status === 401 || error.status === 403) {
      message = 'Invalid Gemini API Key. Please update it in System Configuration.';
    } else if (error.message?.includes('model') || error.status === 404) {
      message = `The model "${modelName}" was not found or is unavailable. Check your configuration.`;
    } else if (error.message) {
      // Use the raw error message if it's safe and informative
      message = error.message.split(':').pop()?.trim() || message;
    }

    throw { 
      status, 
      code: ErrorCode.AI_SERVICE_ERROR, 
      message 
    };
  }
}
