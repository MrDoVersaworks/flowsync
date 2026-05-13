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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

export const joinWorkspaceSchema = z.object({
  inviteCode: z.string().length(8, 'Invite code must be exactly 8 characters'),
});

// Kanban Schemas
export const createColumnSchema = z.object({
  title: z.string().min(1, 'Column title is required'),
});

export const createTaskSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  fromColumnId: z.string().uuid('Invalid from-column ID'),
  toColumnId: z.string().uuid('Invalid to-column ID'),
  newPosition: z.number().int().min(0),
});

// Settings Schemas
export const updateSettingsSchema = z.object({
  geminiKey: z.string().optional(),
  modelConfig: z.string().optional(),
});

// AI Schemas
export const aiBreakdownSchema = z.object({
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
});
