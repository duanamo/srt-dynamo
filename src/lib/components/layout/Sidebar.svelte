<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	import { navigationConfig } from '$lib/config/navigation';
</script>

<aside
	class="bg-white dark:bg-dark-700 text-foreground flex flex-col border-r border-gray-200 dark:border-dark-400 w-64 h-screen fixed left-0 top-0 z-40 hidden md:flex"
>
	<!-- Header Area -->
	<div
		class="h-14 flex border-b border-gray-200 dark:border-dark-400/50 items-center px-4 shrink-0"
	>
		<div class="flex items-center gap-2.5">
			<img src="/dynamo-logo.png" alt="Dynamo" class="h-7" />
		</div>
	</div>

	<!-- Navigation Links -->
	<div class="flex-1 overflow-y-auto py-4 space-y-6">
		{#each navigationConfig as section, i (section.title ?? i)}
			<div class="flex flex-col">
				{#if section.title}
					<span
						class="text-[11px] uppercase tracking-wider text-muted-foreground px-4 mb-2 font-medium"
					>
						{section.title}
					</span>
				{/if}
				<ul class="space-y-0.5 px-2">
					{#each section.items as item (item.path)}
						{@const isActive = $page.url.pathname === item.path}
						{@const NavIcon = item.icon}
						<li>
							<a
								href={item.path}
								class={cn(
									'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 relative',
									isActive
										? 'bg-primary-50 dark:bg-primary-400/10 text-primary-600 dark:text-primary-300 font-medium'
										: 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-dark-500 hover:text-foreground'
								)}
							>
								{#if isActive}
									<div
										class="absolute left-0 top-1 bottom-1 w-[3px] bg-primary-400 rounded-r"
									></div>
								{/if}
								<NavIcon size={18} />
								<span class="truncate">{item.name}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<!-- Footer -->
	<div class="p-3 border-t border-gray-200 dark:border-dark-400/50 shrink-0">
		<div class="text-[10px] text-muted-foreground text-center">Dynamo Technologies</div>
	</div>
</aside>
