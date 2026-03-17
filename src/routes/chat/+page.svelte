<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ChatMessage from '$lib/components/ChatMessage.svelte';

	let { data } = $props();

	// Extra chats added client-side (before server re-renders)
	let newChats: Array<{ id: string; title: string; createdAt: Date }> = $state([]);
	let allChats = $derived([...newChats, ...data.chats]);

	type TreeMessage = {
		id: string;
		parentId: string | null;
		role: string;
		content: string;
	};

	type PathMessage = TreeMessage & {
		siblingCount: number;
		siblingIndex: number;
	};

	let allMessages: TreeMessage[] = $state([]);
	let chatId: string | null = $state(null);
	let input = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let chatContainer: HTMLDivElement | undefined = $state();
	let sidebarOpen = $state(false);
	let selectedBranches: Record<string, number> = $state({});

	function buildActivePath(messages: TreeMessage[], branches: Record<string, number>): PathMessage[] {
		if (messages.length === 0) return [];

		const childrenMap = new Map<string, TreeMessage[]>();
		for (const msg of messages) {
			const key = msg.parentId ?? '__root__';
			if (!childrenMap.has(key)) childrenMap.set(key, []);
			childrenMap.get(key)!.push(msg);
		}

		const path: PathMessage[] = [];
		let currentKey = '__root__';

		while (true) {
			const children = childrenMap.get(currentKey);
			if (!children || children.length === 0) break;

			const selectedIdx = branches[currentKey] ?? children.length - 1;
			const clampedIdx = Math.max(0, Math.min(selectedIdx, children.length - 1));
			const selected = children[clampedIdx];
			path.push({
				...selected,
				siblingCount: children.length,
				siblingIndex: clampedIdx
			});

			currentKey = selected.id;
		}

		return path;
	}

	let activePath: PathMessage[] = $derived(buildActivePath(allMessages, selectedBranches));

	// Sync when server data changes (navigation)
	$effect(() => {
		const msgs = data.allMessages;
		allMessages = msgs.map((m: any) => ({
			id: m.id,
			parentId: m.parentId ?? null,
			role: m.role,
			content: m.content
		}));
		chatId = data.activeChatId;
		selectedBranches = {};
	});

	function scrollToBottom() {
		if (chatContainer) {
			requestAnimationFrame(() => {
				chatContainer!.scrollTop = chatContainer!.scrollHeight;
			});
		}
	}

	$effect(() => {
		if (activePath.length) scrollToBottom();
	});

	function startNewChat() {
		allMessages = [];
		chatId = null;
		error = '';
		selectedBranches = {};
		goto('/chat');
	}

	function switchBranch(parentId: string | null, newIndex: number) {
		const key = parentId ?? '__root__';
		selectedBranches = { ...selectedBranches, [key]: newIndex };
	}

	async function sendToApi(messagesToSend: Array<{ role: string; content: string }>, parentId: string | null) {
		isLoading = true;
		error = '';
		const lastUserMsg = messagesToSend[messagesToSend.length - 1]?.content || '';

		let userMsgId: string | null = null;
		let assistantMsgId: string | null = null;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: messagesToSend, chatId, parentId })
			});

			if (!response.ok) {
				const errBody = await response.text();
				let errMsg = `Failed to get response (${response.status})`;
				try {
					const parsed = JSON.parse(errBody);
					if (parsed.error) errMsg = parsed.error;
				} catch {}
				if (response.status === 429) errMsg = 'API rate limit exceeded. Please wait a moment and try again.';
				throw new Error(errMsg);
			}

			const newChatId = response.headers.get('X-Chat-Id');
			userMsgId = response.headers.get('X-User-Message-Id');
			assistantMsgId = response.headers.get('X-Assistant-Message-Id');

			if (newChatId && newChatId !== chatId) {
				chatId = newChatId;
				newChats = [
					{ id: newChatId, title: lastUserMsg.slice(0, 50) + (lastUserMsg.length > 50 ? '...' : ''), createdAt: new Date() },
					...newChats
				];
			}

			// Add messages to local tree
			allMessages = [
				...allMessages,
				{ id: userMsgId!, parentId, role: 'user', content: lastUserMsg },
				{ id: assistantMsgId!, parentId: userMsgId!, role: 'assistant', content: '' }
			];

			const reader = response.body?.getReader();
			if (!reader) throw new Error('No response body');
			const decoder = new TextDecoder();
			let assistantContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				assistantContent += decoder.decode(value, { stream: true });
				allMessages = allMessages.map((m) =>
					m.id === assistantMsgId ? { ...m, content: assistantContent } : m
				);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
			if (assistantMsgId) {
				allMessages = allMessages.filter((m) => !(m.id === assistantMsgId && !m.content));
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleFork(index: number, newContent: string) {
		const parentId = index > 0 ? activePath[index - 1].id : null;
		// Clear branch selection at fork point so it defaults to the new branch
		const key = parentId ?? '__root__';
		const newBranches = { ...selectedBranches };
		delete newBranches[key];
		selectedBranches = newBranches;

		const messagesToSend = [
			...activePath.slice(0, index).map((m) => ({ role: m.role, content: m.content })),
			{ role: 'user', content: newContent }
		];
		await sendToApi(messagesToSend, parentId);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		input = '';
		error = '';

		const parentId = activePath.length > 0 ? activePath[activePath.length - 1].id : null;
		const messagesToSend = [
			...activePath.map((m) => ({ role: m.role, content: m.content })),
			{ role: 'user', content: userMessage }
		];
		await sendToApi(messagesToSend, parentId);
	}
</script>

<div class="h-[calc(100vh-4rem)] bg-gray-100 p-4 md:p-6">
	<div class="mx-auto flex h-full max-w-7xl gap-4">
		<!-- Sidebar -->
		<div class="hidden w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 md:flex">
			<div class="flex items-center justify-between border-b border-gray-100 p-4">
				<h2 class="text-sm font-semibold text-gray-700">Chat History</h2>
				<button
					onclick={startNewChat}
					class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
				>
					+ New Chat
				</button>
			</div>
			<div class="flex-1 overflow-y-auto p-2">
				{#if allChats.length === 0}
					<p class="px-3 py-6 text-center text-xs text-gray-400">No chats yet</p>
				{:else}
					{#each allChats as chat (chat.id)}
						<div class="group flex items-center gap-1">
							<a
								href="/chat?id={chat.id}"
								class="flex-1 rounded-lg px-3 py-2.5 text-sm transition {chatId === chat.id
									? 'bg-indigo-100 font-medium text-indigo-800'
									: 'text-gray-600 hover:bg-gray-50'}"
							>
								<p class="truncate">{chat.title}</p>
								<p class="mt-0.5 text-[10px] text-gray-400">
									{new Date(chat.createdAt).toLocaleDateString()}
								</p>
							</a>
							<form method="POST" action="?/deleteChat" use:enhance={() => {
								return async ({ update }) => {
									if (chatId === chat.id) startNewChat();
									newChats = newChats.filter(c => c.id !== chat.id);
									update();
								};
							}}>
								<input type="hidden" name="chatId" value={chat.id} />
								<button
									type="submit"
									class="rounded p-1 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
									title="Delete chat"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</form>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Mobile sidebar toggle -->
		<button
			onclick={() => (sidebarOpen = !sidebarOpen)}
			class="fixed bottom-24 left-4 z-50 rounded-full bg-indigo-600 p-3 text-white shadow-lg md:hidden"
			aria-label="Toggle chat history"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
			</svg>
		</button>

		<!-- Mobile sidebar overlay -->
		{#if sidebarOpen}
			<div class="fixed inset-0 z-40 md:hidden">
				<button
					class="absolute inset-0 bg-black/30"
					onclick={() => (sidebarOpen = false)}
					aria-label="Close sidebar"
				></button>
				<div
					in:fly={{ x: -280, duration: 200 }}
					out:fly={{ x: -280, duration: 200 }}
					class="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-gray-200 bg-white"
				>
					<div class="flex items-center justify-between border-b border-gray-200 p-4">
						<h2 class="text-sm font-semibold text-gray-700">Chat History</h2>
						<button
							onclick={() => { startNewChat(); sidebarOpen = false; }}
							class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
						>
							+ New Chat
						</button>
					</div>
					<div class="flex-1 overflow-y-auto p-2">
						{#each allChats as chat (chat.id)}
							<a
								href="/chat?id={chat.id}"
								onclick={() => (sidebarOpen = false)}
								class="mb-1 block rounded-lg px-3 py-2.5 text-sm transition {chatId === chat.id
									? 'bg-indigo-100 font-medium text-indigo-800'
									: 'text-gray-600 hover:bg-gray-100'}"
							>
								<p class="truncate">{chat.title}</p>
							</a>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Chat area -->
		<div class="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-100 px-6 py-3">
				<div>
					<h1 class="text-lg font-bold text-gray-900">
						<span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Chat</span>
					</h1>
					<p class="text-xs text-gray-400">Powered by Gemini</p>
				</div>
				<button
					onclick={startNewChat}
					class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
				>
					+ New Chat
				</button>
			</div>

			<!-- Messages -->
			<div
				bind:this={chatContainer}
				class="flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-8"
			>
				{#if activePath.length === 0}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
								<svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
							</div>
							<p class="text-lg font-medium text-gray-900">Start a conversation</p>
							<p class="mt-1 text-sm text-gray-500">Ask me anything — I'm powered by Google Gemini.</p>
						</div>
					</div>
				{:else}
					{#each activePath as message, i (message.id)}
						<div in:fly={{ y: 10, duration: 300 }} class="pb-2">
							<ChatMessage
								role={message.role}
								content={message.content}
								onEdit={message.role === 'user' && !isLoading ? (newContent) => handleFork(i, newContent) : undefined}
								siblingCount={message.siblingCount}
								siblingIndex={message.siblingIndex}
								onBranchChange={message.siblingCount > 1 ? (newIndex) => switchBranch(message.parentId, newIndex) : undefined}
							/>
						</div>
					{/each}
				{/if}

				{#if isLoading && (activePath.length === 0 || activePath[activePath.length - 1].role !== 'assistant' || !activePath[activePath.length - 1].content)}
					<div in:fade={{ duration: 200 }} class="flex items-center gap-2 text-sm text-gray-400">
						<div class="flex gap-1">
							<span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 0ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 150ms"></span>
							<span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 300ms"></span>
						</div>
						Thinking...
					</div>
				{/if}
			</div>

			<!-- Error -->
			{#if error}
				<div in:fly={{ y: 10, duration: 200 }} class="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 md:mx-8">
					{error}
				</div>
			{/if}

			<!-- Input -->
			<div class="border-t border-gray-100 bg-gray-50/50 px-4 py-4 md:px-8">
				<form onsubmit={handleSubmit} class="flex gap-3">
					<input
						bind:value={input}
						placeholder="Type your message..."
						disabled={isLoading}
						class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
					/>
					<button
						type="submit"
						disabled={isLoading || !input.trim()}
						class="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
					>
						{#if isLoading}
							<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
						{:else}
							Send
						{/if}
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
