<script lang="ts">
	import { Moon, Sun, Menu } from '@lucide/svelte';

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
</script>

<header
	class="h-14 bg-white dark:bg-dark-600 border-b border-gray-200 dark:border-dark-400 flex items-center justify-between px-6 sticky top-0 z-30"
>
	<div class="flex items-center gap-4">
		<button class="md:hidden text-foreground" aria-label="Open menu">
			<Menu size={24} />
		</button>
	</div>

	<div class="flex items-center gap-3">
		<button
			onclick={toggleTheme}
			class="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-500 rounded-lg transition-colors"
			title="Toggle theme"
			aria-label="Toggle theme"
		>
			{#if dark}
				<Sun size={18} />
			{:else}
				<Moon size={18} />
			{/if}
		</button>
	</div>
</header>
