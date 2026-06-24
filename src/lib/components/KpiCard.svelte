<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Component } from 'svelte';

	let {
		title,
		value,
		icon: Icon
	}: { title: string; value: number | string; icon?: Component } = $props();
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
		<Card.Title class="text-muted-foreground text-sm font-medium">{title}</Card.Title>
		{#if Icon}
			<Icon class="text-muted-foreground size-4" aria-hidden="true" />
		{/if}
	</Card.Header>
	<Card.Content>
		<div class="text-foreground text-2xl font-bold">{value}</div>
	</Card.Content>
</Card.Root>
