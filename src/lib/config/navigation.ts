import { LayoutDashboard } from '@lucide/svelte';
import type { Component } from 'svelte';

export interface NavItem {
	name: string;
	path: string;
	icon: Component;
}

export interface NavSection {
	title?: string;
	items: NavItem[];
}

export const navigationConfig: NavSection[] = [
	{
		items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }]
	}
	// Add more sections:
	// {
	// 	title: 'Section Name',
	// 	items: [
	// 		{ name: 'Page Name', path: '/page', icon: SomeIcon }
	// 	]
	// }
];
