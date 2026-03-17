import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) {
		throw error(401, 'Unauthorized');
	}

	await db.delete(users).where(eq(users.id, session.user.id));

	return json({ success: true });
};
