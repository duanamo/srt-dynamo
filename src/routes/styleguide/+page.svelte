<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Moon, Sun, Sparkles, ArrowRight, Check, Info } from '@lucide/svelte';
	import * as Chart from '$lib/components/ui/chart';
	import { BarChart, LineChart } from 'layerchart';

	let dark = $state(false);

	$effect(() => {
		const stored = localStorage.getItem('theme');
		const prefersDark =
			stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
		if (prefersDark) {
			document.documentElement.classList.add('dark');
			dark = true;
		}
	});

	function toggleTheme() {
		document.documentElement.classList.toggle('dark');
		dark = !dark;
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}

	const brandColors = [
		{ name: 'Brand Red', token: 'bg-brand-red', hex: '#F05154', role: 'Primary' },
		{ name: 'Brand Black', token: 'bg-brand-black', hex: '#343433', role: 'Primary' },
		{ name: 'Brand Blue', token: 'bg-brand-blue', hex: '#5789C7', role: 'Secondary' },
		{ name: 'Brand Grey', token: 'bg-brand-grey', hex: '#C1C5D1', role: 'Secondary' },
		{ name: 'Brand White', token: 'bg-brand-white', hex: '#FFFFFF', role: 'Secondary' }
	];

	const primaryScale = [
		{ token: 'bg-primary-50', label: '50' },
		{ token: 'bg-primary-100', label: '100' },
		{ token: 'bg-primary-200', label: '200' },
		{ token: 'bg-primary-300', label: '300' },
		{ token: 'bg-primary-400', label: '400' },
		{ token: 'bg-primary-500', label: '500' },
		{ token: 'bg-primary-600', label: '600' },
		{ token: 'bg-primary-700', label: '700' },
		{ token: 'bg-primary-800', label: '800' },
		{ token: 'bg-primary-900', label: '900' },
		{ token: 'bg-primary-950', label: '950' }
	];

	// Bar chart — two-series, grouped: shows chart-1 (Dynamo Red) + chart-2 (Dynamo Blue)
	const ticketData = [
		{ month: 'Jan', open: 12, closed: 38 },
		{ month: 'Feb', open: 18, closed: 42 },
		{ month: 'Mar', open: 9, closed: 51 },
		{ month: 'Apr', open: 14, closed: 47 },
		{ month: 'May', open: 21, closed: 39 },
		{ month: 'Jun', open: 16, closed: 44 }
	];

	const ticketChartConfig = {
		open: { label: 'Open', color: 'var(--chart-1)' },
		closed: { label: 'Closed', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	// Line chart — single-series time data: features the brand-blue line
	const signInData = [
		{ date: 'Mon', signIns: 24 },
		{ date: 'Tue', signIns: 31 },
		{ date: 'Wed', signIns: 28 },
		{ date: 'Thu', signIns: 35 },
		{ date: 'Fri', signIns: 42 },
		{ date: 'Sat', signIns: 8 },
		{ date: 'Sun', signIns: 5 }
	];

	const signInChartConfig = {
		signIns: { label: 'Sign-ins', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	const semanticTokens = [
		{ token: 'bg-background', label: 'background', text: 'text-foreground' },
		{ token: 'bg-card', label: 'card', text: 'text-card-foreground' },
		{ token: 'bg-muted', label: 'muted', text: 'text-muted-foreground' },
		{ token: 'bg-accent', label: 'accent', text: 'text-accent-foreground' },
		{ token: 'bg-secondary', label: 'secondary', text: 'text-secondary-foreground' },
		{ token: 'bg-primary', label: 'primary', text: 'text-primary-foreground' },
		{ token: 'bg-destructive', label: 'destructive', text: 'text-destructive-foreground' }
	];
</script>

<svelte:head>
	<title>Style Guide · Internal Webapp Template</title>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<header class="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur">
		<div class="container mx-auto flex items-center justify-between py-4">
			<div class="flex items-center gap-2">
				<Sparkles class="text-primary" size={20} />
				<span class="font-semibold">Style Guide</span>
				<Badge variant="outline" class="ml-2">demo</Badge>
			</div>
			<button
				onclick={toggleTheme}
				class="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
				title="Toggle theme"
				aria-label="Toggle theme"
			>
				{#if dark}
					<Sun size={18} />
				{:else}
					<Moon size={18} />
				{/if}
			</button>
		</div>
	</header>

	<main class="container mx-auto py-10 space-y-12">
		<!-- Intro -->
		<section class="max-w-3xl space-y-4">
			<h1 class="text-3xl font-bold tracking-tight">Internal Webapp Template — Style Guide</h1>
			<p class="text-muted-foreground leading-relaxed">
				This page exists to showcase the brand colors, typography, and pre-built UI components
				included with the template. It lives at <code class="bg-muted px-1.5 py-0.5 rounded text-sm"
					>/styleguide</code
				>
				and is publicly accessible (no auth required) so anyone can preview what they're inheriting before
				wiring up Supabase + Azure.
			</p>
			<Card.Root class="border-primary/30 bg-primary/5">
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Check size={16} class="text-primary" />
						Before you ship
					</Card.Title>
				</Card.Header>
				<Card.Content class="text-sm text-muted-foreground space-y-2">
					<p>Once you've started real work, delete this page:</p>
					<pre
						class="bg-muted text-foreground rounded p-3 text-xs overflow-x-auto">rm -rf src/routes/styleguide</pre>
					<p>The components it demonstrates live in <code>$lib/components/ui/</code> and stay.</p>
				</Card.Content>
			</Card.Root>
		</section>

		<Separator />

		<!-- Brand Colors -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Brand Colors</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Direct hex values from the Dynamo Brand Guide, available as Tailwind utilities (e.g.
					<code class="bg-muted px-1 rounded">bg-brand-blue</code>).
				</p>
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
				{#each brandColors as color}
					<div class="space-y-2">
						<div
							class="{color.token} h-24 rounded-lg border border-border shadow-sm"
							aria-label={color.name}
						></div>
						<div>
							<div class="font-medium text-sm">{color.name}</div>
							<div class="text-xs text-muted-foreground font-mono">{color.hex}</div>
							<div class="text-xs text-muted-foreground">{color.role}</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Primary Scale -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Primary Scale</h2>
				<p class="text-muted-foreground text-sm mt-1">
					11-step ramp built around Brand Red <code class="bg-muted px-1 rounded">#F05154</code> at the
					400 step.
				</p>
			</div>
			<div class="grid grid-cols-11 gap-1 rounded-lg overflow-hidden border border-border">
				{#each primaryScale as step}
					<div class="flex flex-col">
						<div class="{step.token} h-16"></div>
						<div class="text-xs text-center py-1 text-muted-foreground">{step.label}</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Semantic Tokens -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Semantic Tokens</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Theme-aware surfaces that swap between light and dark mode. Toggle the moon/sun in the
					header.
				</p>
			</div>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
				{#each semanticTokens as token}
					<div class="{token.token} {token.text} rounded-lg border border-border p-4">
						<div class="font-medium text-sm">{token.label}</div>
						<div class="text-xs opacity-70 font-mono mt-1">{token.token}</div>
					</div>
				{/each}
			</div>
		</section>

		<Separator />

		<!-- Buttons -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Buttons</h2>
				<p class="text-muted-foreground text-sm mt-1">All shadcn-svelte variants and sizes.</p>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Variants</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Button>Default</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="link">Link</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Sizes</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap items-center gap-2">
						<Button size="xs">Extra Small</Button>
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
						<Button size="icon" aria-label="icon"><ArrowRight /></Button>
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Badges -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Badges</h2>
			</div>
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex flex-wrap gap-2">
						<Badge>Default</Badge>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="outline">Outline</Badge>
						<Badge variant="destructive">Destructive</Badge>
						<Badge variant="ghost">Ghost</Badge>
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Form Components -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Form Inputs</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Inputs use the brand-tinted border (<code class="bg-muted px-1 rounded">--border</code>)
					and primary red focus ring.
				</p>
			</div>
			<Card.Root>
				<Card.Content class="pt-6 grid sm:grid-cols-2 gap-6">
					<div class="space-y-2">
						<Label for="demo-name">Name</Label>
						<Input id="demo-name" placeholder="Jane Doe" />
					</div>
					<div class="space-y-2">
						<Label for="demo-email">Email</Label>
						<Input id="demo-email" type="email" placeholder="jane@dynamo.works" />
					</div>
					<div class="space-y-2">
						<Label for="demo-role">Role</Label>
						<Select.Root type="single">
							<Select.Trigger id="demo-role" class="w-full">Select a role…</Select.Trigger>
							<Select.Content>
								<Select.Item value="engineer">Engineer</Select.Item>
								<Select.Item value="designer">Designer</Select.Item>
								<Select.Item value="pm">Product Manager</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<Label for="demo-disabled">Disabled</Label>
						<Input id="demo-disabled" disabled placeholder="Read-only" />
					</div>
					<div class="space-y-2 sm:col-span-2">
						<Label for="demo-notes">Notes</Label>
						<Textarea id="demo-notes" placeholder="Tell us more…" rows={3} />
					</div>
				</Card.Content>
			</Card.Root>
		</section>

		<!-- Tabs + Dialog -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Composite Components</h2>
				<p class="text-muted-foreground text-sm mt-1">Tabs and a dialog trigger.</p>
			</div>
			<div class="grid md:grid-cols-2 gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Tabs</Card.Title>
					</Card.Header>
					<Card.Content>
						<Tabs.Root value="overview">
							<Tabs.List>
								<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
								<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
								<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="overview" class="text-sm text-muted-foreground pt-3">
								The selected tab uses the accent token, which now pulls from Dynamo Blue.
							</Tabs.Content>
							<Tabs.Content value="activity" class="text-sm text-muted-foreground pt-3">
								No recent activity.
							</Tabs.Content>
							<Tabs.Content value="settings" class="text-sm text-muted-foreground pt-3">
								Settings would go here.
							</Tabs.Content>
						</Tabs.Root>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Dialog</Card.Title>
					</Card.Header>
					<Card.Content>
						<Dialog.Root>
							<Dialog.Trigger>
								{#snippet child({ props }: { props: Record<string, unknown> })}
									<Button {...props}>Open dialog</Button>
								{/snippet}
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Sample dialog</Dialog.Title>
									<Dialog.Description>
										Cards, dialogs, dropdowns, sheets, and tooltips are all installed and themed.
									</Dialog.Description>
								</Dialog.Header>
								<Dialog.Footer>
									<Dialog.Close>
										{#snippet child({ props }: { props: Record<string, unknown> })}
											<Button variant="outline" {...props}>Close</Button>
										{/snippet}
									</Dialog.Close>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<!-- Links & Info -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Links & Informational</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Brand red is reserved for primary actions and destructive states. Blue carries
					informational and positive-neutral meaning — body-text links, info banners, "Learn more"
					affordances.
				</p>
			</div>
			<div class="grid md:grid-cols-2 gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Body-text links</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-3 text-sm">
						<p>
							Use the <code class="bg-muted px-1 rounded">link</code> utility on raw
							<code class="bg-muted px-1 rounded">&lt;a&gt;</code> tags inside copy:
							<a href="/styleguide" class="link">read the docs</a> or
							<a href="/styleguide" class="link">see the dashboard</a>.
						</p>
						<p>
							For buttons that visually read as links, use
							<code class="bg-muted px-1 rounded">&lt;Button variant="link"&gt;</code>:
						</p>
						<div>
							<Button variant="link">Learn more</Button>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Info callout</Card.Title>
					</Card.Header>
					<Card.Content>
						<div
							class="flex gap-3 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-4 text-sm"
						>
							<Info class="text-brand-blue shrink-0 mt-0.5" size={18} />
							<div class="space-y-1">
								<div class="font-medium">Heads up</div>
								<p class="text-muted-foreground">
									This is the recommended pattern for informational notices — distinct from warnings
									(amber) and errors (red).
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<!-- Charts -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Charts</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Built on <a href="https://www.layerchart.com" class="link">LayerChart</a> via
					shadcn-svelte's
					<code class="bg-muted px-1 rounded">Chart.Container</code>. Series colors map to
					<code class="bg-muted px-1 rounded">--chart-1</code>
					through <code class="bg-muted px-1 rounded">--chart-5</code>, which are wired to the brand
					palette (Red, Blue, Grey + tints) and adapt automatically to dark mode.
				</p>
			</div>
			<div class="grid lg:grid-cols-2 gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Tickets by month</Card.Title>
						<Card.Description>Grouped bar chart, two series</Card.Description>
					</Card.Header>
					<Card.Content>
						<Chart.Container config={ticketChartConfig} class="h-[260px] w-full">
							<BarChart
								data={ticketData}
								x="month"
								series={[
									{ key: 'open', label: 'Open', color: 'var(--chart-1)' },
									{ key: 'closed', label: 'Closed', color: 'var(--chart-2)' }
								]}
								seriesLayout="group"
								legend
							>
								{#snippet tooltip()}
									<Chart.Tooltip />
								{/snippet}
							</BarChart>
						</Chart.Container>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Daily sign-ins</Card.Title>
						<Card.Description>Single-series line chart</Card.Description>
					</Card.Header>
					<Card.Content>
						<Chart.Container config={signInChartConfig} class="h-[260px] w-full">
							<LineChart
								data={signInData}
								x="date"
								series={[{ key: 'signIns', label: 'Sign-ins', color: 'var(--chart-2)' }]}
							>
								{#snippet tooltip()}
									<Chart.Tooltip />
								{/snippet}
							</LineChart>
						</Chart.Container>
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<!-- Typography -->
		<section class="space-y-4">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight">Typography</h2>
				<p class="text-muted-foreground text-sm mt-1">
					Inter Variable. The brand guide specifies Verdana for print collateral; Inter is the
					closest readable web equivalent.
				</p>
			</div>
			<Card.Root>
				<Card.Content class="pt-6 space-y-3">
					<h1 class="text-4xl font-bold tracking-tight">Heading 1</h1>
					<h2 class="text-3xl font-semibold tracking-tight">Heading 2</h2>
					<h3 class="text-2xl font-semibold">Heading 3</h3>
					<h4 class="text-xl font-medium">Heading 4</h4>
					<p class="leading-relaxed">
						Body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
						tempor incididunt ut labore et dolore magna aliqua.
					</p>
					<p class="text-sm text-muted-foreground">
						Muted small text — used for captions, metadata, and secondary descriptions.
					</p>
					<p class="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">monospace / code</p>
				</Card.Content>
			</Card.Root>
		</section>

		<footer class="pt-8 pb-12 text-center text-xs text-muted-foreground">
			Delete <code class="bg-muted px-1 rounded">src/routes/styleguide</code> when you're ready to ship.
		</footer>
	</main>
</div>
