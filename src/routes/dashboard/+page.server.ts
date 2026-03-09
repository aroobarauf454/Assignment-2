import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, sessions, accounts, chats } from '$lib/server/db/schema';
import { count, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) throw redirect(302, '/login');

	const userId = session.user.id;

	const [userCount] = await db.select({ count: count() }).from(users);
	const [sessionCount] = await db.select({ count: count() }).from(sessions);
	const [accountCount] = await db.select({ count: count() }).from(accounts);

	// Get the current user's full details
	const [currentUser] = await db
		.select({
			name: users.name,
			email: users.email,
			emailVerified: users.emailVerified,
			image: users.image,
			hashedPassword: users.hashedPassword,
			role: users.role,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, userId));

	// Get linked OAuth providers for this user
	const userAccounts = await db
		.select({ provider: accounts.provider })
		.from(accounts)
		.where(eq(accounts.userId, userId));

	// Get chat count for this user
	const [chatCount] = await db
		.select({ count: count() })
		.from(chats)
		.where(eq(chats.userId, userId));

	return {
		stats: {
			users: userCount.count,
			sessions: sessionCount.count,
			accounts: accountCount.count
		},
		profile: {
			name: currentUser?.name,
			email: currentUser?.email,
			emailVerified: currentUser?.emailVerified,
			image: currentUser?.image,
			hasPassword: !!currentUser?.hashedPassword,
			role: currentUser?.role ?? 'user',
			createdAt: currentUser?.createdAt
		},
		linkedProviders: userAccounts.map((a) => a.provider),
		chatCount: chatCount.count
	};
};
