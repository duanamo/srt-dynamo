<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		title,
		description,
		action
	}: {
		icon?: Component;
		title: string;
		description?: string;
		action?: Snippet;
	} = $props();
</script>

<div
	class="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center"
>
	{#if Icon}
		<Icon class="text-muted-foreground mb-3 size-8" aria-hidden="true" />
	{/if}
	<p class="text-foreground font-medium">{title}</p>
	{#if description}
		<p class="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
	{/if}
	{#if action}
		<div class="mt-4">{@render action()}</div>
	{/if}
</div>
