<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Field from './Field.svelte';
	import SelectField from './SelectField.svelte';
	import { ROLES, type UserInput } from '$lib/types';
	import { isValid, validateUser } from '$lib/validation';

	let {
		initial,
		submitLabel,
		onsubmit,
		oncancel
	}: {
		initial?: UserInput;
		submitLabel: string;
		onsubmit: (input: UserInput) => void;
		oncancel?: () => void;
	} = $props();

	// Seed the editable form state once from the prop (a fresh form per route).
	// svelte-ignore state_referenced_locally
	const seed = initial;
	let name = $state(seed?.name ?? '');
	let email = $state(seed?.email ?? '');
	let role = $state<string>(seed?.role ?? '');
	let submitted = $state(false);

	const input = $derived<UserInput>({ name, email, role: role as UserInput['role'] });
	const errors = $derived(validateUser(input));

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (isValid(errors)) onsubmit(input);
	}
</script>

<form onsubmit={handleSubmit} class="max-w-lg space-y-4">
	<Field id="name" label="Name" required error={submitted ? errors.name : undefined}>
		<Input id="name" bind:value={name} placeholder="Jane Doe" />
	</Field>

	<Field id="email" label="Email" required error={submitted ? errors.email : undefined}>
		<Input id="email" type="email" bind:value={email} placeholder="jane@dynamo.works" />
	</Field>

	<SelectField
		id="role"
		label="Role"
		required
		bind:value={role}
		options={ROLES.map((r) => ({ value: r, label: r }))}
		placeholder="Select a role"
		error={submitted ? errors.role : undefined}
	/>

	<div class="flex gap-2 pt-2">
		<Button type="submit">{submitLabel}</Button>
		{#if oncancel}
			<Button type="button" variant="outline" onclick={oncancel}>Cancel</Button>
		{/if}
	</div>
</form>
