<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { Session } from '@auth/sveltekit';
	import Logo from './Logo.svelte';

	let { session }: { session: Session | null } = $props();
	let mobileOpen = $state(false);

	function isActive(path: string): boolean {
		return $page.url.pathname === path;
	}
</script>

<nav class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<div class="flex items-center gap-8">
			<Logo size="sm" />
			{#if session}
				<div class="hidden items-center gap-1 sm:flex">
					<a
						href="/dashboard"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/dashboard')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						Dashboard
					</a>
					<a
						href="/chat"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/chat')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
						AI Chat
					</a>
					<a
						href="/profile"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/profile')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
						</svg>
						Profile
					</a>
					{#if session?.user?.role === 'admin'}
						<a
							href="/admin"
							class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/admin')
								? 'bg-indigo-50 text-indigo-700'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
							</svg>
							Admin
						</a>
					{/if}
				</div>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			{#if session}
				<div class="hidden items-center gap-3 sm:flex">
					<div class="flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-1 pr-3">
						{#if session.user?.image}
							<img
								src={session.user.image}
								alt="Avatar"
								class="h-7 w-7 rounded-full ring-2 ring-white"
							/>
						{:else}
							<div class="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
								{(session.user?.name || session.user?.email || '?')[0].toUpperCase()}
							</div>
						{/if}
						<span class="text-sm font-medium text-gray-700">
							{session.user?.name || session.user?.email}
						</span>
					</div>
					<button
						onclick={() => signOut()}
						class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
						</svg>
						Sign Out
					</button>
				</div>
				<!-- Mobile hamburger -->
				<button
					onclick={() => (mobileOpen = !mobileOpen)}
					class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if mobileOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			{:else}
				<a
					href="/login"
					class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
					</svg>
					Sign In
				</a>
				<a
					href="/register"
					class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
					</svg>
					Sign Up
				</a>
			{/if}
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen && session}
		<div class="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
			<div class="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
				{#if session.user?.image}
					<img src={session.user.image} alt="Avatar" class="h-10 w-10 rounded-full" />
				{:else}
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
						{(session.user?.name || session.user?.email || '?')[0].toUpperCase()}
					</div>
				{/if}
				<div>
					<p class="text-sm font-medium text-gray-900">{session.user?.name || 'User'}</p>
					<p class="text-xs text-gray-500">{session.user?.email}</p>
				</div>
			</div>
			<div class="space-y-1">
				<a
					href="/dashboard"
					onclick={() => (mobileOpen = false)}
					class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/dashboard')
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					<svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					Dashboard
				</a>
				<a
					href="/chat"
					onclick={() => (mobileOpen = false)}
					class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/chat')
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					<svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
					</svg>
					AI Chat
				</a>
				<a
					href="/profile"
					onclick={() => (mobileOpen = false)}
					class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/profile')
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					<svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
					Profile
				</a>
				{#if session?.user?.role === 'admin'}
					<a
						href="/admin"
						onclick={() => (mobileOpen = false)}
						class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/admin')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-700 hover:bg-gray-50'}"
					>
						<svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
						</svg>
						Admin
					</a>
				{/if}
				<button
					onclick={() => signOut()}
					class="mt-2 flex w-full items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-100"
				>
					<svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
					</svg>
					Sign Out
				</button>
			</div>
		</div>
	{/if}
</nav>
