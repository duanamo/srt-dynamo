<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	let dark = $state(browser ? document.documentElement.classList.contains('dark') : false);
	let loading = $state(false);
	let error = $state('');

	function toggleTheme() {
		document.documentElement.classList.toggle('dark');
		dark = !dark;
	}

	async function handleLogin() {
		loading = true;
		error = '';
		const { error: authError } = await data.supabase.auth.signInWithOAuth({
			provider: 'azure',
			options: {
				scopes: 'email profile',
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});
		if (authError) {
			error = authError.message;
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-700">
	<!-- Header bar -->
	<header
		class="h-14 border-b border-gray-200 dark:border-dark-400 bg-white dark:bg-dark-600 flex items-center justify-between px-6"
	>
		<div class="flex items-center gap-3">
			<img src="/dynamo-logo.png" alt="Dynamo" class="h-7" />
		</div>
		<button
			onclick={toggleTheme}
			class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-500 text-muted-foreground transition-colors"
			title="Toggle theme"
		>
			{#if dark}
				<Sun size={18} />
			{:else}
				<Moon size={18} />
			{/if}
		</button>
	</header>

	<!-- Center content -->
	<div class="flex-1 flex items-center justify-center p-6">
		<div class="w-full max-w-sm">
			<!-- Card -->
			<div
				class="bg-white dark:bg-dark-500 rounded-xl shadow-xs border border-gray-200 dark:border-dark-400 overflow-hidden"
			>
				<!-- Red accent bar -->
				<div class="h-1.5 bg-primary-400"></div>

				<div class="p-8">
					<!-- Logo + title -->
					<div class="flex flex-col items-center mb-8">
						<img src="/dynamo-logo.png" alt="Dynamo" class="h-12 mb-4" />
						<h1 class="text-xl font-semibold text-foreground">Dynamo App</h1>
						<p class="text-sm text-muted-foreground mt-1">Sign in to continue</p>
					</div>

					{#if error}
						<p class="text-sm text-danger text-center mb-4">{error}</p>
					{/if}

					<!-- Sign in button -->
					<button
						onclick={handleLogin}
						disabled={loading}
						class="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-300 dark:border-dark-400 bg-white dark:bg-dark-600 hover:bg-gray-50 dark:hover:bg-dark-400 text-sm font-medium text-foreground transition-colors disabled:opacity-50"
					>
						{#if loading}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
							></div>
							Signing in...
						{:else}
							<!-- Microsoft 4-color logo -->
							<svg width="20" height="20" viewBox="0 0 21 21" fill="none">
								<rect x="1" y="1" width="9" height="9" fill="#F25022" />
								<rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
								<rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
								<rect x="11" y="11" width="9" height="9" fill="#FFB900" />
							</svg>
							Sign in with Microsoft
						{/if}
					</button>

					<!-- Helper text -->
					<p class="text-xs text-muted-foreground text-center mt-4">
						Use your Dynamo Microsoft 365 account to sign in
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="py-4 text-center text-xs text-muted-foreground">
		Dynamo &middot; &copy; {new Date().getFullYear()} &middot; Internal Use Only
	</footer>
</div>
