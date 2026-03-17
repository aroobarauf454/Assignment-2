import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { chats, chatMessages } from '$lib/server/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return { chats: [], allMessages: [], activeChatId: null };

	const chatId = event.url.searchParams.get('id');

	const userChats = await db
		.select({ id: chats.id, title: chats.title, createdAt: chats.createdAt })
		.from(chats)
		.where(eq(chats.userId, session.user.id))
		.orderBy(desc(chats.createdAt));

	let allMessages: { id: string; parentId: string | null; role: string; content: string }[] = [];
	let activeChatId: string | null = chatId;

	if (chatId) {
		const rows = await db
			.select({
				id: chatMessages.id,
				parentId: chatMessages.parentId,
				role: chatMessages.role,
				content: chatMessages.content
			})
			.from(chatMessages)
			.where(eq(chatMessages.chatId, chatId))
			.orderBy(asc(chatMessages.createdAt));

		// Legacy flat messages: reconstruct parent chain
		if (rows.length > 0 && rows.every((m) => !m.parentId)) {
			allMessages = rows.map((m, i) => ({
				...m,
				parentId: i === 0 ? null : rows[i - 1].id
			}));
		} else {
			allMessages = rows;
		}
	}

	return { chats: userChats, allMessages, activeChatId };
};

export const actions: Actions = {
	deleteChat: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(401);

		const formData = await request.formData();
		const chatId = formData.get('chatId') as string;

		await db.delete(chats).where(eq(chats.id, chatId));
		return { success: true };
	}
};
