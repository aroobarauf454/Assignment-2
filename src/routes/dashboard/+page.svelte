<script lang="ts">
	import { fly, fade } from 'svelte/transition';

	let { data } = $props();
	let visible = $state(false);

	$effect(() => {
		visible = true;
	});

	const greeting = (() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	})();

	const memberSince = data.profile.createdAt
		? new Date(data.profile.createdAt).toLocaleDateString('en-US', {
				month: 'long',
				year: 'numeric'
			})
		: 'Unknown';

	const authMethod = (() => {
		const methods: string[] = [];
		if (data.profile.hasPassword) methods.push('Email/Password');
		for (const p of data.linkedProviders) {
			methods.push(p.charAt(0).toUpperCase() + p.slice(1));
		}
		return methods.length > 0 ? methods.join(', ') : 'Unknown';
	})();
</script>

{#if visible}
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div in:fly={{ y: 20, duration: 500 }} class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">
				{greeting}, <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{data.session?.user?.name || 'User'}</span>!
			</h1>
			<p class="mt-2 text-gray-500">Manage your account and stay updated with your activity.</p>
		</div>

		<!-- Stats Grid -->
		<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
			<div
				in:fly={{ y: 30, duration: 500, delay: 100 }}
				class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-500">Total Users</p>
					<p class="mt-1 text-3xl font-bold text-gray-900">{data.stats.users}</p>
				</div>
			</div>

			<div
				in:fly={{ y: 30, duration: 500, delay: 200 }}
				class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-500">Active Sessions</p>
					<p class="mt-1 text-3xl font-bold text-gray-900">{data.stats.sessions}</p>
				</div>
			</div>

			<div
				in:fly={{ y: 30, duration: 500, delay: 300 }}
				class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
						<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
					</div>
					<p class="text-sm font-medium text-gray-500">Your Chats</p>
					<p class="mt-1 text-3xl font-bold text-gray-900">{data.chatCount}</p>
				</div>
			</div>
		</div>

		<!-- Profile Status / Email Verification / Security Cards -->
		<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Profile Status -->
			<div
				in:fly={{ y: 30, duration: 500, delay: 400 }}
				class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
			>
				<h3 class="mb-4 flex items-center gap-2 font-semibold text-gray-900">
					<svg class="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
					Profile Status
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Name</span>
						<span class="text-sm font-medium text-gray-900">{data.profile.name || 'Not set'}</span>
					</div>
					<div class="h-px bg-gray-100"></div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Email</span>
						<span class="max-w-[180px] truncate text-sm font-medium text-gray-900">{data.profile.email}</span>
					</div>
					<div class="h-px bg-gray-100"></div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Role</span>
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {data.profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}">
							{data.profile.role.charAt(0).toUpperCase() + data.profile.role.slice(1)}
						</span>
					</div>
					<div class="h-px bg-gray-100"></div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Member since</span>
						<span class="text-sm font-medium text-gray-900">{memberSince}</span>
					</div>
				</div>
			</div>

			<!-- Email Verification -->
			<div
				in:fly={{ y: 30, duration: 500, delay: 500 }}
				class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
			>
				<h3 class="mb-4 flex items-center gap-2 font-semibold text-gray-900">
					<svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
					</svg>
					Email Verification
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Status</span>
						{#if data.profile.emailVerified}
							<span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
								</svg>
								Verified
							</span>
						{:else}
							<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
								</svg>
								Pending
							</span>
						{/if}
					</div>
					{#if data.profile.emailVerified}
						<div class="h-px bg-gray-100"></div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-500">Verified on</span>
							<span class="text-sm font-medium text-gray-900">
								{new Date(data.profile.emailVerified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
							</span>
						</div>
					{/if}
				</div>
				{#if !data.profile.emailVerified}
					<a
						href="/auth/verify-email/resend?email={encodeURIComponent(data.profile.email ?? '')}"
						class="mt-4 block w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-center text-sm font-medium text-amber-700 transition hover:bg-amber-100"
					>
						Verify Now
					</a>
				{/if}
			</div>

			<!-- Security -->
			<div
				in:fly={{ y: 30, duration: 500, delay: 600 }}
				class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
			>
				<h3 class="mb-4 flex items-center gap-2 font-semibold text-gray-900">
					<svg class="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
					</svg>
					Security
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Auth Method</span>
						<span class="text-sm font-medium text-gray-900">{authMethod}</span>
					</div>
					<div class="h-px bg-gray-100"></div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Linked Providers</span>
						<div class="flex items-center gap-1.5">
							{#if data.linkedProviders.length === 0}
								<span class="text-sm text-gray-400">None</span>
							{:else}
								{#each data.linkedProviders as provider}
									<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
										{provider.charAt(0).toUpperCase() + provider.slice(1)}
									</span>
								{/each}
							{/if}
						</div>
					</div>
					<div class="h-px bg-gray-100"></div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-500">Password</span>
						{#if data.profile.hasPassword}
							<span class="inline-flex items-center gap-1 text-sm font-medium text-green-600">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Set
							</span>
						{:else}
							<span class="text-sm text-gray-400">Not set</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Profile Management -->
		<div
			in:fly={{ y: 30, duration: 500, delay: 700 }}
			class="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
		>
			<h2 class="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
				<svg class="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				Profile Management
			</h2>
			<div class="divide-y divide-gray-100">
				<div class="flex items-center justify-between py-4 first:pt-0">
					<div>
						<p class="font-medium text-gray-900">Password Management</p>
						<p class="text-sm text-gray-500">Change your account password to keep it secure</p>
					</div>
					<a
						href="/profile"
						class="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						Change Password
					</a>
				</div>
				<div class="flex items-center justify-between py-4">
					<div>
						<p class="font-medium text-red-600">Delete Account</p>
						<p class="text-sm text-gray-500">Permanently delete your account and all associated data</p>
					</div>
					<button
						onclick={() => { if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) { fetch('/api/delete-account', { method: 'DELETE' }).then(() => window.location.href = '/'); } }}
						class="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
					>
						Delete Account
					</button>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div
			in:fly={{ y: 30, duration: 500, delay: 800 }}
			class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
		>
			<h2 class="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
				<svg class="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
				</svg>
				Quick Actions
			</h2>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<a
					href="/chat"
					class="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">Start Chat</p>
						<p class="text-xs text-gray-500">Chat with AI</p>
					</div>
				</a>
				<a
					href="/profile"
					class="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 hover:shadow-md"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">Edit Profile</p>
						<p class="text-xs text-gray-500">Update your info</p>
					</div>
				</a>
				<a
					href="/auth/forgot-password"
					class="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
						</svg>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-900">Reset Password</p>
						<p class="text-xs text-gray-500">Via email link</p>
					</div>
				</a>
				{#if data.session?.user?.role === 'admin'}
					<a
						href="/admin"
						class="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md"
					>
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900">Admin Panel</p>
							<p class="text-xs text-gray-500">Manage users</p>
						</div>
					</a>
				{/if}
			</div>
		</div>
	</div>
{/if}
