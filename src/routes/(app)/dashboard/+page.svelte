<script lang="ts">
	import { store } from '$lib/data/store.svelte';
	import { dashboardStats } from '$lib/data/operations';
	import KpiCard from '$lib/components/KpiCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { flash } from '$lib/flash.svelte';
	import {
		Activity,
		CircleAlert,
		CircleCheck,
		CircleDot,
		FileText,
		FolderKanban
	} from '@lucide/svelte';

	// `new Date()` is sampled per recomputation (i.e. when store.data changes),
	// not on every clock tick — a dashboard left open across a month boundary
	// without any data change shows the prior period until the next mutation/nav.
	const stats = $derived(dashboardStats(store.data, new Date()));

	let confirmAction = $state<'reset' | 'clear' | null>(null);

	function run() {
		if (confirmAction === 'reset') {
			store.resetToSeed();
			flash.show('success', 'Data reset to the seed dataset.');
		} else if (confirmAction === 'clear') {
			store.clearAll();
			flash.show('success', 'All data cleared.');
		}
		confirmAction = null;
	}
</script>

<div class="mx-auto max-w-[1600px] space-y-6">
	<div>
		<h2 class="text-foreground text-2xl font-bold">Dashboard</h2>
		<p class="text-muted-foreground mt-1 text-sm">An overview of projects and status reports.</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<KpiCard title="Total projects" value={stats.totalProjects} icon={FolderKanban} />
		<KpiCard title="Active projects" value={stats.activeProjects} icon={Activity} />
		<KpiCard title="Reports this period" value={stats.reportsThisPeriod} icon={FileText} />
		<KpiCard title="Green reports" value={stats.green} icon={CircleCheck} />
		<KpiCard title="Yellow reports" value={stats.yellow} icon={CircleDot} />
		<KpiCard title="Red reports" value={stats.red} icon={CircleAlert} />
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Data</Card.Title>
			<Card.Description>
				This app stores everything in your browser. Reset to the sample dataset or clear it.
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-wrap gap-2">
			<Button variant="outline" onclick={() => (confirmAction = 'reset')}>Reset to seed data</Button
			>
			<Button variant="destructive" onclick={() => (confirmAction = 'clear')}>Clear all data</Button
			>
		</Card.Content>
	</Card.Root>
</div>

<Dialog.Root bind:open={() => confirmAction !== null, (open) => !open && (confirmAction = null)}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{confirmAction === 'clear' ? 'Clear all data?' : 'Reset to seed data?'}
			</Dialog.Title>
			<Dialog.Description>
				{confirmAction === 'clear'
					? 'Every user, project, and report will be removed. This can’t be undone.'
					: 'Your current data will be replaced with the sample dataset.'}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (confirmAction = null)}>Cancel</Button>
			<Button variant={confirmAction === 'clear' ? 'destructive' : 'default'} onclick={run}>
				{confirmAction === 'clear' ? 'Clear data' : 'Reset data'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
