import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, sessions, accounts } from '$lib/server/db/schema';
import { count, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			emailVerified: users.emailVerified,
			image: users.image,
			role: users.role,
			disabled: users.disabled
		})
		.from(users)
		.orderBy(users.email);

	const [userCount] = await db.select({ count: count() }).from(users);
	const [sessionCount] = await db.select({ count: count() }).from(sessions);
	const [verifiedCount] = await db
		.select({ count: count() })
		.from(users)
		.where(isNotNull(users.emailVerified));
	const [oauthCount] = await db.select({ count: count() }).from(accounts);
	const [adminCount] = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.role, 'admin'));
	const [disabledCount] = await db
		.select({ count: count() })
		.from(users)
		.where(isNotNull(users.disabled));
	const [passwordUserCount] = await db
		.select({ count: count() })
		.from(users)
		.where(isNotNull(users.hashedPassword));

	return {
		users: allUsers,
		stats: {
			totalUsers: userCount.count,
			activeSessions: sessionCount.count,
			verifiedEmails: verifiedCount.count,
			oauthAccounts: oauthCount.count,
			admins: adminCount.count,
			disabledUsers: disabledCount.count,
			passwordUsers: passwordUserCount.count
		}
	};
};

export const actions: Actions = {
	toggleRole: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user || session.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (userId === session.user?.id) {
			return fail(400, { error: 'Cannot change your own role' });
		}

		const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
		if (!user) return fail(404, { error: 'User not found' });

		const newRole = user.role === 'admin' ? 'user' : 'admin';
		await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

		return { success: true };
	},

	toggleDisable: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user || session.user.role !== 'admin') {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		if (userId === session.user?.id) {
			return fail(400, { error: 'Cannot disable yourself' });
		}

		const [user] = await db
			.select({ disabled: users.disabled })
			.from(users)
			.where(eq(users.id, userId));
		if (!user) return fail(404, { error: 'User not found' });

		const newDisabled = user.disabled ? null : new Date();
		await db.update(users).set({ disabled: newDisabled }).where(eq(users.id, userId));

		return { success: true };
	}
};
