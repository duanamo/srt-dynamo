// Reactive shell around the pure operations: one $state<AppData> singleton that
// hydrates from localStorage (or seeds when empty) on the client, and persists
// the whole envelope after each mutation. SSR-safe via the `browser` guard in
// addition to the app-wide `ssr = false`. See decisions/001-srt-localstorage-schema.md.

import { browser } from '$app/environment';
import { SCHEMA_VERSION, STORAGE_KEY, type AppData } from '$lib/types';
import type { ProjectInput, ReportInput, UserInput } from '$lib/types';
import * as ops from './operations';
import { buildSeed } from './seed';

function emptyData(): AppData {
	return { version: SCHEMA_VERSION, users: [], projects: [], reports: [] };
}

function persist(data: AppData): void {
	if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load(): AppData {
	if (!browser) return emptyData();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<AppData>;
			if (
				parsed?.version === SCHEMA_VERSION &&
				Array.isArray(parsed.users) &&
				Array.isArray(parsed.projects) &&
				Array.isArray(parsed.reports)
			) {
				return parsed as AppData;
			}
		}
	} catch {
		// Corrupt or stale payload — fall through and re-seed.
	}
	const seeded = buildSeed(new Date());
	persist(seeded);
	return seeded;
}

class SrtStore {
	data = $state<AppData>(load());

	createUser(input: UserInput) {
		const r = ops.createUser(this.data, input);
		this.data = r.data;
		persist(this.data);
		return r.user;
	}

	updateUser(id: string, input: UserInput) {
		const r = ops.updateUser(this.data, id, input);
		this.data = r.data;
		persist(this.data);
		return r.user;
	}

	deleteUser(id: string) {
		const r = ops.deleteUser(this.data, id);
		if (r.ok) {
			this.data = r.data;
			persist(this.data);
		}
		return r;
	}

	createProject(input: ProjectInput) {
		const r = ops.createProject(this.data, input);
		this.data = r.data;
		persist(this.data);
		return r.project;
	}

	updateProject(id: string, input: ProjectInput) {
		const r = ops.updateProject(this.data, id, input);
		this.data = r.data;
		persist(this.data);
		return r.project;
	}

	deleteProject(id: string) {
		const r = ops.deleteProject(this.data, id);
		if (r.ok) {
			this.data = r.data;
			persist(this.data);
		}
		return r;
	}

	createReport(input: ReportInput) {
		const r = ops.createReport(this.data, input, new Date());
		this.data = r.data;
		persist(this.data);
		return r.report;
	}

	updateReport(id: string, input: ReportInput) {
		const r = ops.updateReport(this.data, id, input, new Date());
		this.data = r.data;
		persist(this.data);
		return r.report;
	}

	deleteReport(id: string) {
		const r = ops.deleteReport(this.data, id);
		this.data = r.data;
		persist(this.data);
	}

	resetToSeed() {
		this.data = buildSeed(new Date());
		persist(this.data);
	}

	clearAll() {
		this.data = emptyData();
		persist(this.data);
	}
}

export const store = new SrtStore();
