<script lang="ts">
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import ProjectForm from '$lib/components/forms/ProjectForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { ProjectInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	const hasUsers = $derived(store.data.users.length > 0);

	function create(input: ProjectInput) {
		const project = store.createProject(input);
		flash.show('success', `${project.name} created.`);
		goto('/projects');
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/projects"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to projects
	</a>
	<h2 class="text-foreground text-2xl font-bold">New project</h2>

	{#if !hasUsers}
		<p class="text-muted-foreground text-sm">
			A project needs an owner. <a href="/users/new" class="link">Add a user</a> first.
		</p>
	{:else}
		<ProjectForm
			data={store.data}
			submitLabel="Create project"
			onsubmit={create}
			oncancel={() => goto('/projects')}
		/>
	{/if}
</div>
