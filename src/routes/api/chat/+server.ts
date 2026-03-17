import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { chats, chatMessages } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { messages, chatId, parentId } = await request.json();
	const lastMessage = messages[messages.length - 1];

	let activeChatId = chatId;

	// Create a new chat if none provided
	if (!activeChatId) {
		const title = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
		const [newChat] = await db.insert(chats).values({
			userId: session.user.id,
			title
		}).returning({ id: chats.id });
		activeChatId = newChat.id;
	}

	// Save user message with parentId for tree structure
	const userMessageId = crypto.randomUUID();
	await db.insert(chatMessages).values({
		id: userMessageId,
		chatId: activeChatId,
		parentId: parentId || null,
		role: 'user',
		content: lastMessage.content
	});

	const assistantMessageId = crypto.randomUUID();

	try {
		const result = streamText({
			model: google('gemini-2.5-flash'),
			messages,
			onFinish: async ({ text }) => {
				await db.insert(chatMessages).values({
					id: assistantMessageId,
					chatId: activeChatId,
					parentId: userMessageId,
					role: 'assistant',
					content: text
				});
			}
		});

		return new Response(result.textStream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'X-Chat-Id': activeChatId,
				'X-User-Message-Id': userMessageId,
				'X-Assistant-Message-Id': assistantMessageId
			}
		});
	} catch (err: any) {
		const message = err?.message || 'AI service error';
		const status = err?.statusCode === 429 ? 429 : 500;
		return new Response(JSON.stringify({ error: message }), {
			status,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
