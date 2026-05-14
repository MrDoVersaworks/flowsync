import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDecryptedApiKey } from './settings.service.js';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { ErrorCode, DEFAULT_AI_MODEL } from '../constants.js';

import { AITask } from '../types/ai.types.js';

import { tasks, columns } from '../db/schema.js';
import { io } from '../index.js';
import { getBoard, createColumn } from './kanban.service.js';

export async function breakdownGoal(userId: string, workspaceId: string, goal: string, targetColumnId?: string): Promise<AITask[]> {
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

  // 3. Gather Context (Grounding)
  const board = await getBoard(userId, workspaceId);
  const contextString = board.columns.map(col => {
    const taskList = col.tasks.map(t => `- ${t.title}`).join('\n');
    return `Column: [${col.title}]\n${taskList || '(Empty)'}`;
  }).join('\n\n');

  const targetColumnData = targetColumnId ? board.columns.find(c => c.id === targetColumnId) : null;

  const prompt = `
    You are a technical project orchestrator. 
    You are working within a workspace that currently has the following structure:
    ---
    ${contextString}
    ---

    ${targetColumnData ? `CRITICAL: You are specifically targeting the column "[${targetColumnData.title}]". All generated tasks must be relevant to this column's purpose and existing tasks.` : ''}

    Your goal is to break down the following NEW technical objective:
    Goal: "${goal}"

    Instructions:
    1. Break it down into 5 to 8 actionable, technical tasks.
    ${targetColumnData ? `2. ALL tasks will be placed in the "[${targetColumnData.title}]" column.` : `2. If the goal is a COMPLETELY NEW project/category compared to existing tasks, suggest a new column name for it (e.g., "Architecture", "Foundation", "Logic").
    3. If the goal fits into an existing column (like "Backlog" or "In Progress"), use that column title.`}
    4. Ensure the new tasks DO NOT duplicate existing ones.

    Return ONLY a JSON object with this exact structure:
    {
      "suggested_column_title": "${targetColumnData ? targetColumnData.title : 'Title of the column these tasks should go into'}",
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

    // 4. Grounding: Find or Create the suggested column
    let columnId: string;
    
    if (targetColumnId) {
      columnId = targetColumnId;
    } else {
      const suggestedTitle = parsed.suggested_column_title || 'Backlog';
      let targetColumn = await db.select().from(columns)
        .where(and(eq(columns.workspace_id, workspaceId), eq(columns.title, suggestedTitle)))
        .limit(1);
      
      if (targetColumn.length === 0) {
        // Create the new column using the service to handle position/events
        const newCol = await createColumn(userId, workspaceId, suggestedTitle);
        columnId = newCol.id;
      } else {
        columnId = targetColumn[0].id;
      }
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
    logger.error('ERROR', `Technical breakdown aborted`, error);
    
    // Propagate specific Google AI errors if available
    const status = error.status || 500;
    let message = 'Technical orchestration aborted. Please verify your AI configuration.';

    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('429')) {
      message = 'Sovereign quota exceeded. Please verify your Gemini API plan or wait for the rate-limit window to reset.';
    } else if (error.message?.includes('high demand') || error.status === 503) {
      message = 'Infrastructure is experiencing high demand. Please re-synchronize in a few moments.';
    } else if (error.message?.includes('API key') || error.status === 401 || error.status === 403) {
      message = 'Invalid Gemini credentials. Please anchor a valid API Key in System Settings.';
    } else if (error.status === 404 || (error.message?.includes('model') && !error.message?.includes('quota'))) {
      message = `The model "${modelName}" is unavailable or restricted. Check your configuration.`;
    } else if (error.message) {
      message = error.message.split(':').pop()?.trim() || message;
    }

    throw { 
      status: status === 429 ? 429 : status, // Preserve 429 status for the client
      code: ErrorCode.AI_SERVICE_ERROR, 
      message 
    };
  }
}
