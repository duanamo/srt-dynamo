<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background flex">
	<Sidebar />
	<div class="flex-1 flex flex-col md:ml-64 transition-all duration-300">
		<TopBar />
		<main class="flex-1 p-6 overflow-auto">
			{@render children()}
		</main>
	</div>
</div>
