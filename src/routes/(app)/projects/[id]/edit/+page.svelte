<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import ProjectForm from '$lib/components/forms/ProjectForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { ProjectInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	const id = $derived($page.params.id);
	const project = $derived(store.data.projects.find((p) => p.id === id));

	function save(input: ProjectInput) {
		if (!project) return;
		store.updateProject(project.id, input);
		flash.show('success', `${input.name} updated.`);
		goto(`/projects/${project.id}`);
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/projects/{id}"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to project
	</a>

	{#if !project}
		<p class="text-muted-foreground">That project no longer exists.</p>
	{:else}
		<h2 class="text-foreground text-2xl font-bold">Edit project</h2>
		<ProjectForm
			data={store.data}
			initial={{
				name: project.name,
				description: project.description,
				status: project.status,
				ownerId: project.ownerId
			}}
			submitLabel="Save changes"
			onsubmit={save}
			oncancel={() => goto(`/projects/${id}`)}
		/>
	{/if}
</div>
