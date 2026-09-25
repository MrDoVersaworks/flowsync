import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDecryptedApiKey } from './settings.service.js';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { ErrorCode, DEFAULT_AI_MODEL } from '../constants.js';

import { AITask } from '../types/ai.types.js';
import { z } from 'zod';
import { requireWorkspaceMutation } from './authorization.service.js';

import { tasks, columns } from '../db/schema.js';
import { io } from '../index.js';
import { getBoard, verifyColumnInWorkspace } from './kanban.service.js';

const aiBreakdownResultSchema = z.object({
  suggested_column_title: z.string().trim().min(1).max(100),
  tasks: z.array(z.object({
    title: z.string().trim().min(1).max(255),
    description: z.string().max(2000),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
  }).strict()).min(1).max(8),
}).strict();

export async function breakdownGoal(userId: string, workspaceId: string, goal: string, targetColumnId?: string): Promise<AITask[]> {
  await requireWorkspaceMutation(userId, workspaceId);

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
    ${targetColumnData ? `2. ALL tasks will be placed in the "[${targetColumnData.title}]" column.` : `2. ALWAYS suggest a NEW, concise column title specifically named after this goal (e.g., "Stripe Integration", "Auth Layer"). DO NOT use generic names like "Backlog".`}
    3. Ensure the new tasks are highly technical and actionable.

    Return ONLY a JSON object with this exact structure:
    {
      "suggested_column_title": "${targetColumnData ? targetColumnData.title : 'New specific column title'}",
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
    const parsed = aiBreakdownResultSchema.parse(JSON.parse(cleanedText));

    // 4. Persist the entire inception atomically. No realtime event is emitted before commit.
    let columnId: string;
    await db.transaction(async (tx) => {
      if (targetColumnId) {
        const matching = await tx.select({ id: columns.id })
          .from(columns)
          .where(and(eq(columns.id, targetColumnId), eq(columns.workspace_id, workspaceId)))
          .limit(1);
        if (matching.length === 0) {
          throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'Target column not found in this workspace' };
        }
        columnId = targetColumnId;
      } else {
        const [newCol] = await tx.insert(columns).values({
          workspace_id: workspaceId,
          title: parsed.suggested_column_title,
          position: 0,
        }).returning({ id: columns.id });
        columnId = newCol.id;
      }

      const taskValues = parsed.tasks.map((task, index) => ({
        workspace_id: workspaceId,
        column_id: columnId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        position: index,
        created_by: userId,
      }));
      await tx.insert(tasks).values(taskValues);
    });

    // 5. Real-Time Convergence: Broadcast to Sanctuary
    io.to(workspaceId).emit('board-updated', { type: 'AI_INCEPTION', workspaceId });
    logger.info('AI', `Successfully committed AI inception for workspace: ${workspaceId}`);

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

export async function enrichTask(userId: string, title: string, columnTitle?: string): Promise<string> {
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) {
    throw { status: 404, code: ErrorCode.DB_NOT_FOUND, message: 'User not found' };
  }

  const user = userResult[0];
  const apiKey = await getDecryptedApiKey(userId);
  const modelName = user.gemini_model_config || DEFAULT_AI_MODEL;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are a technical project orchestrator.
    Generate a deep, professional technical breakdown and description for the following task title:
    Title: "${title}"
    ${columnTitle ? `Column Context: "${columnTitle}"` : ''}

    Instructions:
    1. Provide a concise but comprehensive technical description.
    2. Focus on implementation details, potential challenges, and required technical stacks.
    ${columnTitle ? `3. Ensure the breakdown is highly relevant to the goal of the "[${columnTitle}]" column.` : ''}
    4. Start with "[AI] " followed by the description.
    5. Keep it between 50 and 200 words.

    Return ONLY the text description.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error: any) {
    logger.error('ERROR', `Task enrichment failed`, error);
    throw {
      status: error.status || 500,
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'Failed to enrich technical context.'
    };
  }
}
