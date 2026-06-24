<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import { flash } from '$lib/flash.svelte';
	import { cn } from '$lib/utils';
	import { CircleCheck, CircleAlert, X } from '@lucide/svelte';

	let { children } = $props();

	// Auto-dismiss the flash a few seconds after it appears.
	$effect(() => {
		if (flash.current) {
			const timer = setTimeout(() => flash.clear(), 4000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="bg-background flex min-h-screen">
	<Sidebar />
	<div class="flex flex-1 flex-col transition-all duration-300 md:ml-64">
		<TopBar />
		<main class="flex-1 overflow-auto p-6">
			{#if flash.current}
				<div
					role="status"
					class={cn(
						'mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
						flash.current.kind === 'success'
							? 'border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
							: 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
					)}
				>
					<span class="flex items-center gap-2">
						{#if flash.current.kind === 'success'}
							<CircleCheck class="size-4 shrink-0" aria-hidden="true" />
						{:else}
							<CircleAlert class="size-4 shrink-0" aria-hidden="true" />
						{/if}
						{flash.current.text}
					</span>
					<button onclick={() => flash.clear()} aria-label="Dismiss" class="shrink-0">
						<X class="size-4" />
					</button>
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
</div>
