import {
	pgTable,
	text,
	timestamp,
	integer,
	primaryKey
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from '@auth/sveltekit/adapters';
import type { InferSelectModel } from 'drizzle-orm';

export const users = pgTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name'),
	email: text('email').unique().notNull(),
	emailVerified: timestamp('email_verified', { mode: 'date' }),
	image: text('image'),
	hashedPassword: text('hashed_password'),
	role: text('role').notNull().default('user'),
	disabled: timestamp('disabled', { mode: 'date' }),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
});

export const accounts = pgTable(
	'accounts',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccountType>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable('sessions', {
	sessionToken: text('session_token').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const verificationTokens = pgTable(
	'verification_tokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(verificationToken) => [
		primaryKey({ columns: [verificationToken.identifier, verificationToken.token] })
	]
);

export const chats = pgTable('chats', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('New Chat'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	chatId: text('chat_id')
		.notNull()
		.references(() => chats.id, { onDelete: 'cascade' }),
	parentId: text('parent_id'),
	role: text('role').notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow()
});

export type User = InferSelectModel<typeof users>;
