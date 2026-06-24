<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Moon, Sun, LogOut, Menu } from '@lucide/svelte';

	let dark = $state(false);

	$effect(() => {
		const stored = localStorage.getItem('theme');
		if (
			stored === 'dark' ||
			(!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			dark = true;
		}
	});

	function toggleTheme() {
		document.documentElement.classList.toggle('dark');
		dark = !dark;
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}

	async function handleLogout() {
		const { supabase } = $page.data;
		await supabase.auth.signOut();
		await invalidateAll();
		goto('/login');
	}

	let initials = $derived.by(() => {
		const session = $page.data.session;
		if (!session?.user) return '??';
		const name =
			session.user.user_metadata?.full_name ||
			session.user.user_metadata?.name ||
			session.user.email ||
			'';
		return (
			name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2) || '??'
		);
	});
</script>

<header
	class="h-14 bg-white dark:bg-dark-600 border-b border-gray-200 dark:border-dark-400 flex items-center justify-between px-6 sticky top-0 z-30"
>
	<div class="flex items-center gap-4">
		<button class="md:hidden text-foreground">
			<Menu size={24} />
		</button>
	</div>

	<div class="flex items-center gap-3">
		<button
			onclick={toggleTheme}
			class="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
			title="Toggle theme"
		>
			{#if dark}
				<Sun size={18} />
			{:else}
				<Moon size={18} />
			{/if}
		</button>

		<div class="flex items-center gap-2 ml-1">
			<div
				class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300 cursor-pointer"
			>
				{initials}
			</div>
			<button
				onclick={handleLogout}
				class="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
				title="Sign out"
			>
				<LogOut size={16} />
			</button>
		</div>
	</div>
</header>
