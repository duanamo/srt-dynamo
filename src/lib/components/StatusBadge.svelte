<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { OverallStatus, ProjectStatus } from '$lib/types';

	let { status }: { status: ProjectStatus | OverallStatus } = $props();

	// Color carries the status, but the label text is always present too, so the
	// state is never conveyed by color alone (ui-ux-conventions).
	const styles: Record<string, string> = {
		Green:
			'border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
		Yellow:
			'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
		Red: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
		Active:
			'border-transparent bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
		'At Risk':
			'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
		Complete: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
		'On Hold': 'border-transparent bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300'
	};
</script>

<Badge variant="outline" class={styles[status]}>{status}</Badge>
