<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import UserForm from '$lib/components/forms/UserForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { UserInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	const id = $derived($page.params.id);
	const user = $derived(store.data.users.find((u) => u.id === id));

	function save(input: UserInput) {
		if (!user) return;
		store.updateUser(user.id, input);
		flash.show('success', `${input.name} updated.`);
		goto(`/users/${user.id}`);
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/users/{id}"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to user
	</a>

	{#if !user}
		<p class="text-muted-foreground">That user no longer exists.</p>
	{:else}
		<h2 class="text-foreground text-2xl font-bold">Edit user</h2>
		<UserForm
			initial={{ name: user.name, email: user.email, role: user.role }}
			submitLabel="Save changes"
			onsubmit={save}
			oncancel={() => goto(`/users/${id}`)}
		/>
	{/if}
</div>
