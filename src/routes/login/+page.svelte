<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly, fade } from 'svelte/transition';
	import OAuthButtons from '$lib/components/OAuthButtons.svelte';

	let { form } = $props();
	let loading = $state(false);
	let visible = $state(false);

	$effect(() => {
		visible = true;
	});
</script>

<div class="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
	{#if visible}
		<div in:fly={{ y: 30, duration: 600 }} class="w-full max-w-md">
			<div class="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
				<!-- Header -->
				<div class="mb-8 text-center">
					<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
						<svg class="h-7 w-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
						</svg>
					</div>
					<h2 class="text-2xl font-bold text-gray-900">Welcome back</h2>
					<p class="mt-1 text-gray-500">Sign in to your account</p>
				</div>

				{#if form?.error}
					<div in:fly={{ y: -10, duration: 300 }} class="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
						<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
						</svg>
						<div>
							{form.error}
							{#if form?.emailNotVerified}
								<a
									href="/auth/verify-email/resend?email={encodeURIComponent(form.email ?? '')}"
									class="mt-1 block font-medium text-indigo-600 hover:text-indigo-500"
								>
									Resend verification email
								</a>
							{/if}
						</div>
					</div>
				{/if}

				<form
					method="POST"
					autocomplete="off"
					use:enhance={() => {
						loading = true;
						return async ({ update }) => {
							loading = false;
							await update();
						};
					}}
					class="space-y-5"
				>
					<div>
						<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autocomplete="off"
							value={form?.email ?? ''}
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
							placeholder="you@example.com"
						/>
					</div>
					<div>
						<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="off"
							class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
							placeholder="Enter your password"
						/>
						<div class="mt-1 text-right">
							<a
								href="/auth/forgot-password"
								class="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
							>
								Forgot password?
							</a>
						</div>
					</div>
					<button
						type="submit"
						disabled={loading}
						class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:opacity-50"
					>
						{#if loading}
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
							</svg>
							Signing in...
						{:else}
							Sign In
						{/if}
					</button>
				</form>

				<div class="my-6 flex items-center gap-4">
					<div class="h-px flex-1 bg-gray-200"></div>
					<span class="text-xs font-medium uppercase tracking-wider text-gray-400">or continue with</span>
					<div class="h-px flex-1 bg-gray-200"></div>
				</div>

				<OAuthButtons />

				<p class="mt-6 text-center text-sm text-gray-500">
					Don't have an account?
					<a href="/register" class="font-semibold text-indigo-600 transition hover:text-indigo-500">Sign up</a>
				</p>
			</div>
		</div>
	{/if}
</div>
