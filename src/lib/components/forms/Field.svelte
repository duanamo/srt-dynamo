<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import type { Snippet } from 'svelte';

	let {
		id,
		label,
		error,
		required = false,
		children
	}: {
		id: string;
		label: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="space-y-1.5">
	<Label for={id}>
		{label}{#if required}<span class="text-destructive">&nbsp;*</span>{/if}
	</Label>
	{@render children()}
	{#if error}
		<p class="text-destructive text-sm">{error}</p>
	{/if}
</div>
