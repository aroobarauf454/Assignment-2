import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session) {
		throw redirect(303, '/login');
	}
	if (session.user?.role !== 'admin') {
		throw redirect(303, '/dashboard');
	}
	return { session };
};
