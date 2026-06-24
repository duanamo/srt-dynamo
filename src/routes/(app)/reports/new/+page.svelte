<script lang="ts">
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import ReportForm from '$lib/components/forms/ReportForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { ReportInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	const hasPrereqs = $derived(store.data.projects.length > 0 && store.data.users.length > 0);

	function create(input: ReportInput) {
		store.createReport(input);
		flash.show('success', 'Report created.');
		goto('/reports');
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/reports"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to reports
	</a>
	<h2 class="text-foreground text-2xl font-bold">New status report</h2>

	{#if !hasPrereqs}
		<p class="text-muted-foreground text-sm">
			A report needs a project and an author. Add at least one
			<a href="/projects/new" class="link">project</a> and
			<a href="/users/new" class="link">user</a> first.
		</p>
	{:else}
		<ReportForm
			data={store.data}
			submitLabel="Create report"
			onsubmit={create}
			oncancel={() => goto('/reports')}
		/>
	{/if}
</div>
