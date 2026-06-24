<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { canDeleteUser } from '$lib/data/operations';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import DeleteButton from '$lib/components/DeleteButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { Plus, Users } from '@lucide/svelte';

	const users = $derived(store.data.users);
</script>

<div class="mx-auto max-w-[1600px] space-y-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h2 class="text-foreground text-2xl font-bold">Users</h2>
			<p class="text-muted-foreground mt-1 text-sm">People who own projects and author reports.</p>
		</div>
		<Button href="/users/new"><Plus aria-hidden="true" /> New user</Button>
	</div>

	{#if users.length === 0}
		<EmptyState icon={Users} title="No users yet" description="Add a user to get started.">
			{#snippet action()}
				<Button href="/users/new"><Plus aria-hidden="true" /> New user</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="rounded-xl border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Role</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each users as user (user.id)}
						<Table.Row>
							<Table.Cell>
								<a href="/users/{user.id}" class="font-medium hover:underline">{user.name}</a>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{user.email}</Table.Cell>
							<Table.Cell><Badge variant="outline">{user.role}</Badge></Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-2">
									<Button href="/users/{user.id}/edit" variant="outline" size="sm">Edit</Button>
									<DeleteButton
										name={user.name}
										entityLabel="user"
										check={() => canDeleteUser(store.data, user.id)}
										remove={() => store.deleteUser(user.id)}
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
