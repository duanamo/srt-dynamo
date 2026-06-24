import { LayoutDashboard, Users, FolderKanban, FileText } from '@lucide/svelte';
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
	},
	{
		title: 'Records',
		items: [
			{ name: 'Users', path: '/users', icon: Users },
			{ name: 'Projects', path: '/projects', icon: FolderKanban },
			{ name: 'Status reports', path: '/reports', icon: FileText }
		]
	}
];
