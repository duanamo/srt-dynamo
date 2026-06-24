// Domain types for the Status Report Tracker. This is the hand-written types
// module CLAUDE.md designates as `$lib/types.ts`; components import from here.
// There is no backend, so these are the source of truth for the data shape
// persisted in localStorage (see decisions/001-srt-localstorage-schema.md).

export const ROLES = ['Developer', 'Project Manager', 'Executive'] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = ['Active', 'At Risk', 'Complete', 'On Hold'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const OVERALL_STATUSES = ['Green', 'Yellow', 'Red'] as const;
export type OverallStatus = (typeof OVERALL_STATUSES)[number];

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
}

export interface Project {
	id: string;
	name: string;
	description: string;
	status: ProjectStatus;
	ownerId: string;
}

export interface StatusReport {
	id: string;
	projectId: string;
	authorId: string;
	/** Calendar month the report covers, "YYYY-MM". */
	reportingPeriod: string;
	accomplishments: string;
	blockers: string;
	nextSteps: string;
	overallStatus: OverallStatus;
	/** ISO 8601. Set on create. */
	createdAt: string;
	/** ISO 8601. Set on create, bumped on every edit. */
	updatedAt: string;
}

/** The full persisted dataset, stored as one JSON blob under `srt:data`. */
export interface AppData {
	version: number;
	users: User[];
	projects: Project[];
	reports: StatusReport[];
}

// Persistence contract — see decisions/001-srt-localstorage-schema.md.
export const STORAGE_KEY = 'srt:data';
export const SCHEMA_VERSION = 1;

// Form payloads — the fields a user supplies. Ids and timestamps are assigned
// by the create/update operations, not the form.
export type UserInput = Omit<User, 'id'>;
export type ProjectInput = Omit<Project, 'id'>;
export type ReportInput = Omit<StatusReport, 'id' | 'createdAt' | 'updatedAt'>;

/** A field → message map; empty means valid. Drives inline form errors. */
export type ValidationErrors = Record<string, string>;

/** Result of a deletion guard: `ok` to proceed, else a human-readable `reason`. */
export type DeleteCheck = { ok: true } | { ok: false; reason: string };
