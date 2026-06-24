<script lang="ts">
	import { goto } from '$app/navigation';
	import { store } from '$lib/data/store.svelte';
	import UserForm from '$lib/components/forms/UserForm.svelte';
	import { flash } from '$lib/flash.svelte';
	import type { UserInput } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	function create(input: UserInput) {
		const user = store.createUser(input);
		flash.show('success', `${user.name} created.`);
		goto('/users');
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<a
		href="/users"
		class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to users
	</a>
	<h2 class="text-foreground text-2xl font-bold">New user</h2>
	<UserForm submitLabel="Create user" onsubmit={create} oncancel={() => goto('/users')} />
</div>
