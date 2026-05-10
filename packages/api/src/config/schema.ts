import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
  index,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: text('password').notNull(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    usernameIdx: index('users_username_idx').on(table.username),
  })
);

// Projects/Analysis table
export const analyses = pgTable(
  'analyses',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    projectName: varchar('project_name', { length: 255 }).notNull(),
    description: text('description'),
    sourceType: varchar('source_type', { length: 50 }).notNull(), // 'zip', 'github', 'local'
    repositoryUrl: varchar('repository_url', { length: 500 }),
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processing, completed, failed
    progress: integer('progress').default(0).notNull(), // 0-100
    startedAt: timestamp('started_at', { mode: 'string' }),
    completedAt: timestamp('completed_at', { mode: 'string' }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('analyses_user_id_idx').on(table.userId),
    statusIdx: index('analyses_status_idx').on(table.status),
    createdAtIdx: index('analyses_created_at_idx').on(table.createdAt),
  })
);

// Analysis Results table
export const analysisResults = pgTable(
  'analysis_results',
  {
    id: serial('id').primaryKey(),
    analysisId: integer('analysis_id')
      .references(() => analyses.id, { onDelete: 'cascade' })
      .notNull(),
    dimension: varchar('dimension', { length: 100 }).notNull(), // 'code_quality', 'security', 'test_coverage', 'architecture', 'problem_alignment', 'performance'
    score: integer('score').notNull(), // 0-100
    details: jsonb('details').notNull(), // { issues: [], suggestions: [], metrics: {} }
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => ({
    analysisIdIdx: index('analysis_results_analysis_id_idx').on(table.analysisId),
    dimensionIdx: index('analysis_results_dimension_idx').on(table.dimension),
  })
);

// Reports table
export const reports = pgTable(
  'reports',
  {
    id: serial('id').primaryKey(),
    analysisId: integer('analysis_id')
      .references(() => analyses.id, { onDelete: 'cascade' })
      .notNull(),
    format: varchar('format', { length: 50 }).notNull(), // 'pdf', 'markdown', 'json'
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size'),
    summary: jsonb('summary').notNull(), // { overallScore, scores: {}, topIssues: [], topSuggestions: [] }
    generatedAt: timestamp('generated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => ({
    analysisIdIdx: index('reports_analysis_id_idx').on(table.analysisId),
    formatIdx: index('reports_format_idx').on(table.format),
  })
);

// Sessions table for auth
export const sessions = pgTable(
  'sessions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: text('token').unique().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    tokenIdx: index('sessions_token_idx').on(table.token),
  })
);
