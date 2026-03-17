<script lang="ts">
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let visible = $state(false);

	$effect(() => {
		visible = true;
	});
</script>

{#if visible}
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div in:fly={{ y: 20, duration: 500 }} class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">
				<span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</span>
			</h1>
			<p class="mt-2 text-gray-500">Manage users and view application analytics.</p>
		</div>

		<!-- Stats Grid -->
		<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [
				{ label: 'Total Users', value: data.stats.totalUsers, color: 'indigo' },
				{ label: 'Active Sessions', value: data.stats.activeSessions, color: 'green' },
				{ label: 'Verified Emails', value: data.stats.verifiedEmails, color: 'blue' },
				{ label: 'OAuth Accounts', value: data.stats.oauthAccounts, color: 'purple' },
				{ label: 'Admins', value: data.stats.admins, color: 'orange' },
				{ label: 'Disabled Users', value: data.stats.disabledUsers, color: 'red' },
				{ label: 'Password Users', value: data.stats.passwordUsers, color: 'teal' }
			] as stat, i}
				<div
					in:fly={{ y: 30, duration: 500, delay: 100 + i * 50 }}
					class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
				>
					<p class="text-xs font-medium text-gray-500">{stat.label}</p>
					<p class="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
				</div>
			{/each}
		</div>

		<!-- Users Table -->
		<div
			in:fly={{ y: 30, duration: 500, delay: 500 }}
			class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200"
		>
			<div class="border-b border-gray-200 px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">All Users</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							<th class="px-6 py-3">User</th>
							<th class="px-6 py-3">Email Verified</th>
							<th class="px-6 py-3">Role</th>
							<th class="px-6 py-3">Status</th>
							<th class="px-6 py-3">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each data.users as user}
							<tr class="transition hover:bg-gray-50" class:opacity-50={user.disabled}>
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										{#if user.image}
											<img src={user.image} alt="" class="h-8 w-8 rounded-full" />
										{:else}
											<div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
												{(user.name || user.email || '?')[0].toUpperCase()}
											</div>
										{/if}
										<div>
											<p class="font-medium text-gray-900">{user.name || 'No name'}</p>
											<p class="text-sm text-gray-500">{user.email}</p>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									{#if user.emailVerified}
										<span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
											Verified
										</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
											Pending
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {user.role === 'admin'
										? 'bg-indigo-50 text-indigo-700'
										: 'bg-gray-100 text-gray-700'}">
										{user.role}
									</span>
								</td>
								<td class="px-6 py-4">
									{#if user.disabled}
										<span class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
											Disabled
										</span>
									{:else}
										<span class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
											Active
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									{#if user.id !== data.session?.user?.id}
										<div class="flex gap-2">
											<form method="POST" action="?/toggleRole" use:enhance>
												<input type="hidden" name="userId" value={user.id} />
												<button
													type="submit"
													class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
												>
													{user.role === 'admin' ? 'Demote' : 'Make Admin'}
												</button>
											</form>
											<form method="POST" action="?/toggleDisable" use:enhance>
												<input type="hidden" name="userId" value={user.id} />
												<button
													type="submit"
													class="rounded-lg border px-3 py-1.5 text-xs font-medium transition {user.disabled
														? 'border-green-200 text-green-700 hover:bg-green-50'
														: 'border-red-200 text-red-700 hover:bg-red-50'}"
												>
													{user.disabled ? 'Enable' : 'Disable'}
												</button>
											</form>
										</div>
									{:else}
										<span class="text-xs text-gray-400">Current user</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
