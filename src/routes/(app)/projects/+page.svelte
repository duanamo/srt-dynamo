<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { canDeleteProject } from '$lib/data/operations';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { FolderKanban, Plus } from '@lucide/svelte';

	const projects = $derived(store.data.projects);

	function ownerName(id: string) {
		return store.data.users.find((u) => u.id === id)?.name ?? 'Unknown';
	}
</script>

<div class="mx-auto max-w-[1600px] space-y-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h2 class="text-foreground text-2xl font-bold">Projects</h2>
			<p class="text-muted-foreground mt-1 text-sm">Work being tracked through status reports.</p>
		</div>
		<Button href="/projects/new"><Plus aria-hidden="true" /> New project</Button>
	</div>

	{#if projects.length === 0}
		<EmptyState
			icon={FolderKanban}
			title="No projects yet"
			description="Create a project to start tracking status."
		>
			{#snippet action()}
				<Button href="/projects/new"><Plus aria-hidden="true" /> New project</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="rounded-xl border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Owner</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each projects as project (project.id)}
						<Table.Row>
							<Table.Cell>
								<a href="/projects/{project.id}" class="font-medium hover:underline"
									>{project.name}</a
								>
							</Table.Cell>
							<Table.Cell><StatusBadge status={project.status} /></Table.Cell>
							<Table.Cell class="text-muted-foreground">{ownerName(project.ownerId)}</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-2">
									<Button href="/projects/{project.id}/edit" variant="outline" size="sm"
										>Edit</Button
									>
									<DeleteButton
										name={project.name}
										entityLabel="project"
										check={() => canDeleteProject(store.data, project.id)}
										remove={() => store.deleteProject(project.id)}
									/>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
