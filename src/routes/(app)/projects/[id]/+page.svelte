<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import { canDeleteProject } from '$lib/data/operations';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	const project = $derived(store.data.projects.find((p) => p.id === $page.params.id));
	const owner = $derived(
		project ? store.data.users.find((u) => u.id === project.ownerId) : undefined
	);
	const reports = $derived(
		project ? store.data.reports.filter((r) => r.projectId === project.id) : []
	);
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<a
		href="/projects"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to projects
	</a>

	{#if !project}
		<p class="text-muted-foreground">That project no longer exists.</p>
	{:else}
		<div class="flex items-start justify-between gap-4">
			<div>
				<div class="flex items-center gap-3">
					<h2 class="text-foreground text-2xl font-bold">{project.name}</h2>
					<StatusBadge status={project.status} />
				</div>
				<p class="text-muted-foreground mt-1 text-sm">
					Owner:
					{#if owner}
						<a href="/users/{owner.id}" class="hover:underline">{owner.name}</a>
					{:else}
						Unknown
					{/if}
				</p>
			</div>
			<div class="flex gap-2">
				<Button href="/projects/{project.id}/edit" variant="outline" size="sm">Edit</Button>
				<DeleteButton
					name={project.name}
					entityLabel="project"
					check={() => canDeleteProject(store.data, project.id)}
					remove={() => store.deleteProject(project.id)}
					onDeleted={() => goto('/projects')}
				/>
			</div>
		</div>

		{#if project.description}
			<p class="text-foreground text-sm">{project.description}</p>
		{/if}

		<Card.Root>
			<Card.Header><Card.Title>Status reports ({reports.length})</Card.Title></Card.Header>
			<Card.Content>
				{#if reports.length === 0}
					<p class="text-muted-foreground text-sm">No reports for this project yet.</p>
				{:else}
					<ul class="divide-y">
						{#each reports as report (report.id)}
							<li class="flex items-center justify-between py-2">
								<a href="/reports/{report.id}" class="hover:underline">
									{report.reportingPeriod} ·
									{store.data.users.find((u) => u.id === report.authorId)?.name ?? 'Unknown'}
								</a>
								<StatusBadge status={report.overallStatus} />
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
