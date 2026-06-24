<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import { canDeleteUser } from '$lib/data/operations';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	const user = $derived(store.data.users.find((u) => u.id === $page.params.id));
	const ownedProjects = $derived(
		user ? store.data.projects.filter((p) => p.ownerId === user.id) : []
	);
	const authoredReports = $derived(
		user ? store.data.reports.filter((r) => r.authorId === user.id) : []
	);
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<a
		href="/users"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to users
	</a>

	{#if !user}
		<p class="text-muted-foreground">That user no longer exists.</p>
	{:else}
		<div class="flex items-start justify-between gap-4">
			<div>
				<h2 class="text-foreground text-2xl font-bold">{user.name}</h2>
				<p class="text-muted-foreground mt-1 text-sm">{user.email}</p>
				<div class="mt-2"><Badge variant="outline">{user.role}</Badge></div>
			</div>
			<div class="flex gap-2">
				<Button href="/users/{user.id}/edit" variant="outline" size="sm">Edit</Button>
				<DeleteButton
					name={user.name}
					entityLabel="user"
					check={() => canDeleteUser(store.data, user.id)}
					remove={() => store.deleteUser(user.id)}
					onDeleted={() => goto('/users')}
				/>
			</div>
		</div>

		<Card.Root>
			<Card.Header><Card.Title>Owned projects ({ownedProjects.length})</Card.Title></Card.Header>
			<Card.Content>
				{#if ownedProjects.length === 0}
					<p class="text-muted-foreground text-sm">None.</p>
				{:else}
					<ul class="divide-y">
						{#each ownedProjects as project (project.id)}
							<li class="flex items-center justify-between py-2">
								<a href="/projects/{project.id}" class="hover:underline">{project.name}</a>
								<StatusBadge status={project.status} />
							</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Authored reports ({authoredReports.length})</Card.Title></Card.Header
			>
			<Card.Content>
				{#if authoredReports.length === 0}
					<p class="text-muted-foreground text-sm">None.</p>
				{:else}
					<ul class="divide-y">
						{#each authoredReports as report (report.id)}
							<li class="flex items-center justify-between py-2">
								<a href="/reports/{report.id}" class="hover:underline">
									{store.data.projects.find((p) => p.id === report.projectId)?.name ?? 'Unknown'} ·
									{report.reportingPeriod}
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
