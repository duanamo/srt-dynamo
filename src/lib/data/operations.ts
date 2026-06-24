// Pure domain operations over a plain AppData object — no reactivity, no
// localStorage. Everything the rules depend on lives here so it is unit-testable
// in the node test environment without jsdom (see the reactive shell in
// store.svelte.ts). Updates are immutable: each returns a new AppData so the
// runes store can reassign $state and trigger reactivity.

import type {
	AppData,
	DeleteCheck,
	Project,
	ProjectInput,
	ReportInput,
	StatusReport,
	User,
	UserInput
} from '$lib/types';

/** Deletion result: the new dataset on success, or a human-readable reason. */
export type DeleteResult = { ok: true; data: AppData } | { ok: false; reason: string };

export function findUser(data: AppData, id: string): User | undefined {
	return data.users.find((u) => u.id === id);
}

export function findProject(data: AppData, id: string): Project | undefined {
	return data.projects.find((p) => p.id === id);
}

export function findReport(data: AppData, id: string): StatusReport | undefined {
	return data.reports.find((r) => r.id === id);
}

/** The calendar month of `date` as "YYYY-MM" (local time). */
export function periodOf(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `${date.getFullYear()}-${month}`;
}

export interface DashboardStats {
	totalProjects: number;
	activeProjects: number;
	reportsThisPeriod: number;
	green: number;
	yellow: number;
	red: number;
}

// `now` is injected rather than read internally so "reports this period" is
// testable with frozen time (STYLEGUIDE.md:245). "This period" is matched
// against each report's reportingPeriod (its subject month), not createdAt.
export function dashboardStats(data: AppData, now: Date): DashboardStats {
	const period = periodOf(now);
	return {
		totalProjects: data.projects.length,
		activeProjects: data.projects.filter((p) => p.status === 'Active').length,
		reportsThisPeriod: data.reports.filter((r) => r.reportingPeriod === period).length,
		green: data.reports.filter((r) => r.overallStatus === 'Green').length,
		yellow: data.reports.filter((r) => r.overallStatus === 'Yellow').length,
		red: data.reports.filter((r) => r.overallStatus === 'Red').length
	};
}

// ---- Users ----

export function createUser(data: AppData, input: UserInput): { data: AppData; user: User } {
	const user: User = { id: crypto.randomUUID(), ...input };
	return { data: { ...data, users: [...data.users, user] }, user };
}

export function updateUser(
	data: AppData,
	id: string,
	input: UserInput
): { data: AppData; user: User } {
	const user: User = { id, ...input };
	return { data: { ...data, users: data.users.map((u) => (u.id === id ? user : u)) }, user };
}

// A user is referenced — and so blocked from deletion — when they author any
// report or own any project (ADR-002: both edges, not just report authorship).
export function canDeleteUser(data: AppData, id: string): DeleteCheck {
	const ownedProjects = data.projects.filter((p) => p.ownerId === id).length;
	const authoredReports = data.reports.filter((r) => r.authorId === id).length;
	if (ownedProjects === 0 && authoredReports === 0) return { ok: true };

	const name = findUser(data, id)?.name ?? 'this user';
	const parts: string[] = [];
	if (ownedProjects > 0) parts.push(`${ownedProjects} project${ownedProjects === 1 ? '' : 's'}`);
	if (authoredReports > 0)
		parts.push(`${authoredReports} report${authoredReports === 1 ? '' : 's'}`);
	return {
		ok: false,
		reason: `Can't delete ${name} — still referenced by ${parts.join(' and ')}. Reassign or delete those first.`
	};
}

export function deleteUser(data: AppData, id: string): DeleteResult {
	const check = canDeleteUser(data, id);
	if (!check.ok) return check;
	return { ok: true, data: { ...data, users: data.users.filter((u) => u.id !== id) } };
}

// ---- Projects ----

export function createProject(
	data: AppData,
	input: ProjectInput
): { data: AppData; project: Project } {
	const project: Project = { id: crypto.randomUUID(), ...input };
	return { data: { ...data, projects: [...data.projects, project] }, project };
}

export function updateProject(
	data: AppData,
	id: string,
	input: ProjectInput
): { data: AppData; project: Project } {
	const project: Project = { id, ...input };
	return {
		data: { ...data, projects: data.projects.map((p) => (p.id === id ? project : p)) },
		project
	};
}

// A project is blocked from deletion when any report references it.
export function canDeleteProject(data: AppData, id: string): DeleteCheck {
	const refs = data.reports.filter((r) => r.projectId === id).length;
	if (refs === 0) return { ok: true };
	const name = findProject(data, id)?.name ?? 'this project';
	return {
		ok: false,
		reason: `Can't delete ${name} — ${refs} report${refs === 1 ? '' : 's'} reference it. Delete those reports first.`
	};
}

export function deleteProject(data: AppData, id: string): DeleteResult {
	const check = canDeleteProject(data, id);
	if (!check.ok) return check;
	return { ok: true, data: { ...data, projects: data.projects.filter((p) => p.id !== id) } };
}

// ---- Status reports ----
// Reports are never referenced by other records, so they are always deletable.

export function createReport(
	data: AppData,
	input: ReportInput,
	now: Date
): { data: AppData; report: StatusReport } {
	const stamp = now.toISOString();
	const report: StatusReport = {
		id: crypto.randomUUID(),
		...input,
		createdAt: stamp,
		updatedAt: stamp
	};
	return { data: { ...data, reports: [...data.reports, report] }, report };
}

export function updateReport(
	data: AppData,
	id: string,
	input: ReportInput,
	now: Date
): { data: AppData; report: StatusReport } {
	const existing = findReport(data, id);
	const report: StatusReport = {
		...input,
		id,
		createdAt: existing?.createdAt ?? now.toISOString(),
		updatedAt: now.toISOString()
	};
	return {
		data: { ...data, reports: data.reports.map((r) => (r.id === id ? report : r)) },
		report
	};
}

export function deleteReport(data: AppData, id: string): { data: AppData } {
	return { data: { ...data, reports: data.reports.filter((r) => r.id !== id) } };
}
