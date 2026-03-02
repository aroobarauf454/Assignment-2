<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { Session } from '@auth/core/types';
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
						class="rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/dashboard')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
					>
						Dashboard
					</a>
					<a
						href="/profile"
						class="rounded-lg px-3 py-2 text-sm font-medium transition {isActive('/profile')
							? 'bg-indigo-50 text-indigo-700'
							: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
					>
						Profile
					</a>
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
						class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
					>
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
					class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
				>
					Sign In
				</a>
				<a
					href="/register"
					class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
				>
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
					class="block rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/dashboard')
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					Dashboard
				</a>
				<a
					href="/profile"
					onclick={() => (mobileOpen = false)}
					class="block rounded-lg px-3 py-2.5 text-sm font-medium transition {isActive('/profile')
						? 'bg-indigo-50 text-indigo-700'
						: 'text-gray-700 hover:bg-gray-50'}"
				>
					Profile
				</a>
				<button
					onclick={() => signOut()}
					class="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-100"
				>
					Sign Out
				</button>
			</div>
		</div>
	{/if}
</nav>
