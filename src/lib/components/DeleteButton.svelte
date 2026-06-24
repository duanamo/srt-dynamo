<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Trash2 } from '@lucide/svelte';
	import { flash } from '$lib/flash.svelte';
	import type { DeleteCheck } from '$lib/types';

	let {
		name,
		entityLabel,
		check,
		remove,
		onDeleted,
		size = 'sm',
		label = 'Delete'
	}: {
		name: string;
		entityLabel: string;
		/** Referential-integrity guard. Omit for entities that are always deletable. */
		check?: () => DeleteCheck;
		remove: () => void;
		onDeleted?: () => void;
		size?: 'sm' | 'default';
		label?: string;
	} = $props();

	let open = $state(false);
	let blockReason = $state<string | null>(null);

	function start() {
		const result = check ? check() : { ok: true as const };
		blockReason = result.ok ? null : result.reason;
		open = true;
	}

	function confirm() {
		remove();
		flash.show('success', `${name} deleted.`);
		open = false;
		onDeleted?.();
	}
</script>

<Button variant="destructive" {size} onclick={start}>
	<Trash2 aria-hidden="true" />
	{label}
</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{blockReason ? `Can't delete ${name}` : `Delete ${name}?`}</Dialog.Title>
			<Dialog.Description>
				{blockReason ?? `This ${entityLabel} will be permanently removed. This can't be undone.`}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			{#if blockReason}
				<Button variant="outline" onclick={() => (open = false)}>Close</Button>
			{:else}
				<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button variant="destructive" onclick={confirm}>Delete</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
