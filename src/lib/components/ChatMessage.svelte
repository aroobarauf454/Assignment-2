<script lang="ts">
	import { marked } from 'marked';

	let {
		role,
		content,
		onEdit,
		siblingCount = 1,
		siblingIndex = 0,
		onBranchChange
	}: {
		role: string;
		content: string;
		onEdit?: (newContent: string) => void;
		siblingCount?: number;
		siblingIndex?: number;
		onBranchChange?: (newIndex: number) => void;
	} = $props();

	let copied = $state(false);
	let editing = $state(false);
	let editText = $state(content);

	let renderedContent = $derived(
		role !== 'user' ? marked.parse(content, { async: false }) as string : ''
	);

	function copyToClipboard() {
		navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function startEdit() {
		editText = content;
		editing = true;
	}

	function saveEdit() {
		if (editText.trim() && onEdit) {
			onEdit(editText.trim());
		}
		editing = false;
	}

	function cancelEdit() {
		editing = false;
	}
</script>

<div class="group flex {role === 'user' ? 'justify-end' : 'justify-start'}">
	<div class="relative max-w-[80%]">
		<div
			class="rounded-2xl px-4 py-3 text-sm leading-relaxed {role === 'user'
				? 'bg-indigo-600 text-white'
				: 'bg-gray-100 text-gray-900'}"
		>
			{#if role !== 'user'}
				<p class="mb-1 text-xs font-medium text-indigo-600">Gemini</p>
			{/if}

			{#if editing}
				<textarea
					bind:value={editText}
					onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') cancelEdit(); }}
					class="w-full resize-none rounded-lg border border-indigo-300 bg-white p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
					rows={Math.min(editText.split('\n').length + 1, 6)}
				></textarea>
				<div class="mt-2 flex gap-2">
					<button onclick={saveEdit} class="rounded-md bg-indigo-700 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-800">
						Save & Resend
					</button>
					<button onclick={cancelEdit} class="rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300">
						Cancel
					</button>
				</div>
			{:else if role === 'user'}
				<div class="whitespace-pre-wrap">{content}</div>
			{:else}
				<div class="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-table:my-2 prose-pre:my-2 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-indigo-600 prose-code:before:content-[''] prose-code:after:content-['']">
					{@html renderedContent}
				</div>
			{/if}
		</div>

		<!-- Action buttons -->
		{#if !editing}
			<div class="mt-1.5 flex {role === 'user' ? 'justify-end' : 'justify-start'} items-center gap-1 opacity-0 transition group-hover:opacity-100">
				<button
					onclick={copyToClipboard}
					class="flex items-center justify-center rounded-md bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-600"
					title="Copy message"
				>
					{#if copied}
						<svg class="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					{/if}
				</button>
				{#if role === 'user' && onEdit}
					<button
						onclick={startEdit}
						class="flex items-center justify-center rounded-md bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-600"
						title="Edit & fork conversation"
					>
						<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
				{/if}
				{#if siblingCount > 1 && onBranchChange}
					<div class="flex items-center gap-1 rounded-md bg-white px-1.5 py-1 shadow-sm ring-1 ring-gray-200">
						<button
							onclick={() => onBranchChange!(siblingIndex - 1)}
							disabled={siblingIndex === 0}
							class="text-gray-400 transition hover:text-gray-600 disabled:opacity-30"
						>
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<span class="min-w-[2rem] text-center text-[11px] font-medium text-gray-500">
							{siblingIndex + 1} / {siblingCount}
						</span>
						<button
							onclick={() => onBranchChange!(siblingIndex + 1)}
							disabled={siblingIndex === siblingCount - 1}
							class="text-gray-400 transition hover:text-gray-600 disabled:opacity-30"
						>
							<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
