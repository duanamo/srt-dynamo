<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import Field from './Field.svelte';
	import SelectField from './SelectField.svelte';
	import { PROJECT_STATUSES, type AppData, type ProjectInput } from '$lib/types';
	import { isValid, validateProject } from '$lib/validation';

	let {
		data,
		initial,
		submitLabel,
		onsubmit,
		oncancel
	}: {
		data: AppData;
		initial?: ProjectInput;
		submitLabel: string;
		onsubmit: (input: ProjectInput) => void;
		oncancel?: () => void;
	} = $props();

	// Seed editable state once from the prop; the form owns it thereafter and is
	// recreated per route. svelte-ignore silences state_referenced_locally — the
	// one-time read at init is intentional, not a missed reactive dependency.
	// svelte-ignore state_referenced_locally
	const seed = initial;
	let name = $state(seed?.name ?? '');
	let description = $state(seed?.description ?? '');
	let status = $state<string>(seed?.status ?? '');
	let ownerId = $state(seed?.ownerId ?? '');
	let submitted = $state(false);

	const input = $derived<ProjectInput>({
		name,
		description,
		status: status as ProjectInput['status'],
		ownerId
	});
	const errors = $derived(validateProject(input, data));
	const ownerOptions = $derived(
		data.users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))
	);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (isValid(errors)) onsubmit(input);
	}
</script>

<form onsubmit={handleSubmit} class="max-w-lg space-y-4">
	<Field id="name" label="Name" required error={submitted ? errors.name : undefined}>
		<Input id="name" bind:value={name} placeholder="Apollo Dashboard" />
	</Field>

	<Field id="description" label="Description">
		<Textarea id="description" bind:value={description} placeholder="What is this project about?" />
	</Field>

	<SelectField
		id="status"
		label="Status"
		required
		bind:value={status}
		options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))}
		placeholder="Select a status"
		error={submitted ? errors.status : undefined}
	/>

	<SelectField
		id="owner"
		label="Owner"
		required
		bind:value={ownerId}
		options={ownerOptions}
		placeholder="Select an owner"
		error={submitted ? errors.ownerId : undefined}
	/>

	<div class="flex gap-2 pt-2">
		<Button type="submit">{submitLabel}</Button>
		{#if oncancel}
			<Button type="button" variant="outline" onclick={oncancel}>Cancel</Button>
		{/if}
	</div>
</form>
