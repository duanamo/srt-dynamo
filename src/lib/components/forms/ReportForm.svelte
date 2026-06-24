<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import Field from './Field.svelte';
	import SelectField from './SelectField.svelte';
	import { OVERALL_STATUSES, type AppData, type ReportInput } from '$lib/types';
	import { isValid, validateReport } from '$lib/validation';
	import { periodOf } from '$lib/data/operations';

	let {
		data,
		initial,
		submitLabel,
		onsubmit,
		oncancel
	}: {
		data: AppData;
		initial?: ReportInput;
		submitLabel: string;
		onsubmit: (input: ReportInput) => void;
		oncancel?: () => void;
	} = $props();

	// Seed the editable form state once from the prop (a fresh form per route).
	// svelte-ignore state_referenced_locally
	const seed = initial;
	let projectId = $state(seed?.projectId ?? '');
	let authorId = $state(seed?.authorId ?? '');
	// New reports default to the current month; the wall clock here is only a
	// form default, not business logic (the testable rules inject the clock).
	let reportingPeriod = $state(seed?.reportingPeriod ?? periodOf(new Date()));
	let overallStatus = $state<string>(seed?.overallStatus ?? '');
	let accomplishments = $state(seed?.accomplishments ?? '');
	let blockers = $state(seed?.blockers ?? '');
	let nextSteps = $state(seed?.nextSteps ?? '');
	let submitted = $state(false);

	const input = $derived<ReportInput>({
		projectId,
		authorId,
		reportingPeriod,
		overallStatus: overallStatus as ReportInput['overallStatus'],
		accomplishments,
		blockers,
		nextSteps
	});
	const errors = $derived(validateReport(input, data));
	const projectOptions = $derived(data.projects.map((p) => ({ value: p.id, label: p.name })));
	const authorOptions = $derived(data.users.map((u) => ({ value: u.id, label: u.name })));

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (isValid(errors)) onsubmit(input);
	}
</script>

<form onsubmit={handleSubmit} class="max-w-2xl space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<SelectField
			id="project"
			label="Project"
			required
			bind:value={projectId}
			options={projectOptions}
			placeholder="Select a project"
			error={submitted ? errors.projectId : undefined}
		/>
		<SelectField
			id="author"
			label="Author"
			required
			bind:value={authorId}
			options={authorOptions}
			placeholder="Select an author"
			error={submitted ? errors.authorId : undefined}
		/>
		<Field
			id="period"
			label="Reporting period"
			required
			error={submitted ? errors.reportingPeriod : undefined}
		>
			<Input id="period" type="month" bind:value={reportingPeriod} />
		</Field>
		<SelectField
			id="overall"
			label="Overall status"
			required
			bind:value={overallStatus}
			options={OVERALL_STATUSES.map((s) => ({ value: s, label: s }))}
			placeholder="Select a status"
			error={submitted ? errors.overallStatus : undefined}
		/>
	</div>

	<Field
		id="accomplishments"
		label="Accomplishments"
		required
		error={submitted ? errors.accomplishments : undefined}
	>
		<Textarea id="accomplishments" bind:value={accomplishments} />
	</Field>

	<Field id="blockers" label="Blockers">
		<Textarea id="blockers" bind:value={blockers} placeholder="None" />
	</Field>

	<Field
		id="nextSteps"
		label="Next steps"
		required
		error={submitted ? errors.nextSteps : undefined}
	>
		<Textarea id="nextSteps" bind:value={nextSteps} />
	</Field>

	<div class="flex gap-2 pt-2">
		<Button type="submit">{submitLabel}</Button>
		{#if oncancel}
			<Button type="button" variant="outline" onclick={oncancel}>Cancel</Button>
		{/if}
	</div>
</form>
