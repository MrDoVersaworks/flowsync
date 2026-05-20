import { pgTable, uuid, varchar, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// TABLE: users
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  encrypted_gemini_key: text('encrypted_gemini_key'),
  gemini_key_iv: varchar('gemini_key_iv', { length: 24 }),
  gemini_key_tag: varchar('gemini_key_tag', { length: 32 }),
  gemini_model_config: varchar('gemini_model_config', { length: 100 }).default('gemini-2.5-flash'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: workspaces
// ============================================================
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  owner_id: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invite_code: varchar('invite_code', { length: 20 }).notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: workspace_members
// ============================================================
export const workspaceMembers = pgTable('workspace_members', {
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workspace_id: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('member'), // 'admin' | 'member' | 'viewer'
  joined_at: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: columns (Kanban Columns)
// ============================================================
export const columns = pgTable('columns', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspace_id: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  position: integer('position').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: tasks (Kanban Cards)
// ============================================================
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspace_id: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  column_id: uuid('column_id').notNull().references(() => columns.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  created_by: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: task_comments
// ============================================================
export const taskComments = pgTable('task_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  task_id: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// TABLE: task_reads (Track when user last read comments for a task)
// ============================================================
export const taskReads = pgTable('task_reads', {
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  task_id: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  last_read_at: timestamp('last_read_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.task_id] }),
}));

// ============================================================
// RELATIONS
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(workspaceMembers),
  ownedWorkspaces: many(workspaces),
  comments: many(taskComments),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.owner_id], references: [users.id] }),
  members: many(workspaceMembers),
  columns: many(columns),
  tasks: many(tasks),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [columns.workspace_id], references: [workspaces.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [tasks.workspace_id], references: [workspaces.id] }),
  column: one(columns, { fields: [tasks.column_id], references: [columns.id] }),
  creator: one(users, { fields: [tasks.created_by], references: [users.id] }),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, { fields: [taskComments.task_id], references: [tasks.id] }),
  user: one(users, { fields: [taskComments.user_id], references: [users.id] }),
}));
