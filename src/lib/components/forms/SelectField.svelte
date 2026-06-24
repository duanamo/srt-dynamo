<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import Field from './Field.svelte';

	type Option = { value: string; label: string };

	let {
		id,
		label,
		value = $bindable(''),
		options,
		placeholder = 'Select…',
		error,
		required = false,
		disabled = false
	}: {
		id: string;
		label: string;
		value?: string;
		options: Option[];
		placeholder?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
	} = $props();

	const selectedLabel = $derived(options.find((o) => o.value === value)?.label);
</script>

<Field {id} {label} {error} {required}>
	<Select.Root type="single" bind:value {disabled}>
		<Select.Trigger {id} class="w-full" aria-invalid={error ? 'true' : undefined}>
			{selectedLabel ?? placeholder}
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option.value)}
				<Select.Item value={option.value} label={option.label} />
			{/each}
		</Select.Content>
	</Select.Root>
</Field>
