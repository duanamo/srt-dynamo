<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { OVERALL_STATUSES } from '$lib/types';
	import { FileText, Plus } from '@lucide/svelte';

	let projectFilter = $state('');
	let authorFilter = $state('');
	let periodFilter = $state('');
	let statusFilter = $state('');

	const reports = $derived(store.data.reports);
	const periods = $derived([...new Set(reports.map((r) => r.reportingPeriod))].sort().reverse());

	const filtered = $derived(
		reports.filter(
			(r) =>
				(!projectFilter || r.projectId === projectFilter) &&
				(!authorFilter || r.authorId === authorFilter) &&
				(!periodFilter || r.reportingPeriod === periodFilter) &&
				(!statusFilter || r.overallStatus === statusFilter)
		)
	);

	const projectOptions = $derived([
		{ value: '', label: 'All projects' },
		...store.data.projects.map((p) => ({ value: p.id, label: p.name }))
	]);
	const authorOptions = $derived([
		{ value: '', label: 'All authors' },
		...store.data.users.map((u) => ({ value: u.id, label: u.name }))
	]);
	const periodOptions = $derived([
		{ value: '', label: 'All periods' },
		...periods.map((p) => ({ value: p, label: p }))
	]);
	// Static, not $derived: built from the OVERALL_STATUSES constant, not store data.
	const statusOptions = [
		{ value: '', label: 'All statuses' },
		...OVERALL_STATUSES.map((s) => ({ value: s, label: s }))
	];

	function projectName(id: string) {
		return store.data.projects.find((p) => p.id === id)?.name ?? 'Unknown';
	}
	function authorName(id: string) {
		return store.data.users.find((u) => u.id === id)?.name ?? 'Unknown';
	}
</script>

<div class="mx-auto max-w-[1600px] space-y-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h2 class="text-foreground text-2xl font-bold">Status reports</h2>
			<p class="text-muted-foreground mt-1 text-sm">Per-project updates by reporting period.</p>
		</div>
		<Button href="/reports/new"><Plus aria-hidden="true" /> New report</Button>
	</div>

	{#if reports.length === 0}
		<EmptyState
			icon={FileText}
			title="No status reports yet"
			description="Create a report to track a project's progress."
		>
			{#snippet action()}
				<Button href="/reports/new"><Plus aria-hidden="true" /> New report</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<SelectField
				id="f-project"
				label="Project"
				bind:value={projectFilter}
				options={projectOptions}
			/>
			<SelectField id="f-author" label="Author" bind:value={authorFilter} options={authorOptions} />
			<SelectField
				id="f-period"
				label="Reporting period"
				bind:value={periodFilter}
				options={periodOptions}
			/>
			<SelectField
				id="f-status"
				label="Overall status"
				bind:value={statusFilter}
				options={statusOptions}
			/>
		</div>

		<p class="text-muted-foreground text-sm">
			Showing {filtered.length} of {reports.length} reports.
		</p>

		{#if filtered.length === 0}
			<EmptyState title="No reports match these filters" description="Try clearing a filter." />
		{:else}
			<div class="rounded-xl border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Project</Table.Head>
							<Table.Head>Author</Table.Head>
							<Table.Head>Period</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each filtered as report (report.id)}
							<Table.Row>
								<Table.Cell>
									<a href="/reports/{report.id}" class="font-medium hover:underline">
										{projectName(report.projectId)}
									</a>
								</Table.Cell>
								<Table.Cell class="text-muted-foreground">{authorName(report.authorId)}</Table.Cell>
								<Table.Cell>{report.reportingPeriod}</Table.Cell>
								<Table.Cell><StatusBadge status={report.overallStatus} /></Table.Cell>
								<Table.Cell>
									<div class="flex justify-end gap-2">
										<Button href="/reports/{report.id}/edit" variant="outline" size="sm"
											>Edit</Button
										>
										<DeleteButton
											name="this report"
											entityLabel="report"
											remove={() => store.deleteReport(report.id)}
										/>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	{/if}
</div>
