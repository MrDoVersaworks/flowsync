import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '../constants.js';

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: unknown) {
    let message = 'Invalid request data';
    if (error instanceof z.ZodError) {
      message = error.issues[0]?.message || message;
    }
    
    res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message,
      }
    });
  }
};

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100, 'Name too long'),
});

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string()
    .length(8, 'Invite code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code must be uppercase alphanumeric'),
});

// Kanban Schemas
export const createColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required').max(100, 'Title too long'),
});

export const createTaskSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  title: z.string().min(1, 'Task title is required').max(255, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255, 'Title too long').optional(),
  description: z.string().max(10000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().datetime().optional().nullable(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  fromColumnId: z.string().uuid('Invalid from-column ID'),
  toColumnId: z.string().uuid('Invalid to-column ID'),
  newPosition: z.number().int().min(0),
});

// Settings Schemas
export const updateSettingsSchema = z.object({
  geminiKey: z.string().max(500, 'API Key too long').optional(),
  modelConfig: z.string().max(100, 'Model config too long').optional(),
});

// AI Schemas
export const aiBreakdownSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  goal: z.string().min(10, 'Goal must be at least 10 characters').max(5000, 'Goal too long'),
  targetColumnId: z.string().uuid('Invalid column ID').optional(),
});
