<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	const report = $derived(store.data.reports.find((r) => r.id === $page.params.id));
	const project = $derived(
		report ? store.data.projects.find((p) => p.id === report.projectId) : undefined
	);
	const author = $derived(
		report ? store.data.users.find((u) => u.id === report.authorId) : undefined
	);

	function formatStamp(iso: string) {
		return new Date(iso).toLocaleString();
	}
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<a
		href="/reports"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to reports
	</a>

	{#if !report}
		<p class="text-muted-foreground">That report no longer exists.</p>
	{:else}
		<div class="flex items-start justify-between gap-4">
			<div>
				<div class="flex items-center gap-3">
					<h2 class="text-foreground text-2xl font-bold">{project?.name ?? 'Unknown project'}</h2>
					<StatusBadge status={report.overallStatus} />
				</div>
				<p class="text-muted-foreground mt-1 text-sm">
					{report.reportingPeriod} ·
					{#if author}
						<a href="/users/{author.id}" class="hover:underline">{author.name}</a>
					{:else}
						Unknown author
					{/if}
				</p>
			</div>
			<div class="flex gap-2">
				<Button href="/reports/{report.id}/edit" variant="outline" size="sm">Edit</Button>
				<DeleteButton
					name="this report"
					entityLabel="report"
					remove={() => store.deleteReport(report.id)}
					onDeleted={() => goto('/reports')}
				/>
			</div>
		</div>

		<Card.Root>
			<Card.Content class="space-y-4 pt-6">
				<div>
					<h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Accomplishments
					</h3>
					<p class="text-foreground mt-1 whitespace-pre-line text-sm">{report.accomplishments}</p>
				</div>
				<div>
					<h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Blockers
					</h3>
					<p class="text-foreground mt-1 whitespace-pre-line text-sm">
						{report.blockers || 'None.'}
					</p>
				</div>
				<div>
					<h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">
						Next steps
					</h3>
					<p class="text-foreground mt-1 whitespace-pre-line text-sm">{report.nextSteps}</p>
				</div>
			</Card.Content>
		</Card.Root>

		<p class="text-muted-foreground text-xs">
			Created {formatStamp(report.createdAt)} · Updated {formatStamp(report.updatedAt)}
		</p>
	{/if}
</div>
