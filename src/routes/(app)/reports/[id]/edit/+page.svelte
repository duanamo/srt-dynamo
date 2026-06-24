<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import ReportForm from '$lib/components/forms/ReportForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { ReportInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	const id = $derived($page.params.id);
	const report = $derived(store.data.reports.find((r) => r.id === id));

	function save(input: ReportInput) {
		if (!report) return;
		store.updateReport(report.id, input);
		flash.show('success', 'Report updated.');
		goto(`/reports/${report.id}`);
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/reports/{id}"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to report
	</a>

	{#if !report}
		<p class="text-muted-foreground">That report no longer exists.</p>
	{:else}
		<h2 class="text-foreground text-2xl font-bold">Edit status report</h2>
		<ReportForm
			data={store.data}
			initial={{
				projectId: report.projectId,
				authorId: report.authorId,
				reportingPeriod: report.reportingPeriod,
				overallStatus: report.overallStatus,
				accomplishments: report.accomplishments,
				blockers: report.blockers,
				nextSteps: report.nextSteps
			}}
			submitLabel="Save changes"
			onsubmit={save}
			oncancel={() => goto(`/reports/${id}`)}
		/>
	{/if}
</div>
