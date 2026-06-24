import { describe, it, expect } from 'vitest';
import type { AppData } from '$lib/types';
import {
	canDeleteProject,
	canDeleteUser,
	createReport,
	createUser,
	dashboardStats,
	deleteProject,
	deleteReport,
	deleteUser,
	periodOf,
	updateReport,
	updateUser
} from './operations';

// u1 owns p1+p2 and authors r1 (referenced everywhere); u2 references nothing.
// p1 is referenced by r1; p2 is referenced by nothing.
function baseData(): AppData {
	return {
		version: 1,
		users: [
			{ id: 'u1', name: 'Owner Author', email: 'oa@example.com', role: 'Developer' },
			{ id: 'u2', name: 'Free Agent', email: 'fa@example.com', role: 'Executive' }
		],
		projects: [
			{ id: 'p1', name: 'Referenced', description: '', status: 'Active', ownerId: 'u1' },
			{ id: 'p2', name: 'Unreferenced', description: '', status: 'On Hold', ownerId: 'u1' }
		],
		reports: [
			{
				id: 'r1',
				projectId: 'p1',
				authorId: 'u1',
				reportingPeriod: '2026-06',
				overallStatus: 'Green',
				accomplishments: 'Shipped',
				blockers: '',
				nextSteps: 'More',
				createdAt: '2026-06-01T00:00:00.000Z',
				updatedAt: '2026-06-01T00:00:00.000Z'
			}
		]
	};
}

describe('periodOf', () => {
	it('formats a date as YYYY-MM with a zero-padded month', () => {
		expect(periodOf(new Date(2026, 0, 5))).toBe('2026-01');
		expect(periodOf(new Date(2026, 11, 31))).toBe('2026-12');
	});
});

describe('user CRUD', () => {
	it('creates a user immutably with a generated id', () => {
		const data = baseData();
		const { data: next, user } = createUser(data, {
			name: 'New Person',
			email: 'np@example.com',
			role: 'Project Manager'
		});
		expect(user.id).toBeTruthy();
		expect(next.users).toHaveLength(3);
		expect(data.users).toHaveLength(2); // original not mutated
	});

	it('updates a user while preserving the id', () => {
		const { data: next, user } = updateUser(baseData(), 'u1', {
			name: 'Renamed',
			email: 'renamed@example.com',
			role: 'Executive'
		});
		expect(user).toEqual({
			id: 'u1',
			name: 'Renamed',
			email: 'renamed@example.com',
			role: 'Executive'
		});
		expect(next.users.find((u) => u.id === 'u1')?.name).toBe('Renamed');
	});
});

describe('referential integrity — users', () => {
	it('blocks deleting a user who owns a project or authors a report', () => {
		const data = baseData();
		const check = canDeleteUser(data, 'u1');
		expect(check.ok).toBe(false);
		if (!check.ok) expect(check.reason).toMatch(/project/);
		expect(deleteUser(data, 'u1').ok).toBe(false);
	});

	it('allows deleting an unreferenced user', () => {
		const data = baseData();
		expect(canDeleteUser(data, 'u2').ok).toBe(true);
		const result = deleteUser(data, 'u2');
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.users.some((u) => u.id === 'u2')).toBe(false);
	});

	it('allows deleting a user once their references are gone', () => {
		// Remove the project owned by u1's second project and the report, leaving
		// only p1 owned by u1 — still blocked; then strip those too.
		const data = baseData();
		const stripped: AppData = { ...data, projects: [], reports: [] };
		expect(canDeleteUser(stripped, 'u1').ok).toBe(true);
	});
});

describe('referential integrity — projects', () => {
	it('blocks deleting a project referenced by a report', () => {
		const data = baseData();
		expect(canDeleteProject(data, 'p1').ok).toBe(false);
		expect(deleteProject(data, 'p1').ok).toBe(false);
	});

	it('allows deleting a project with no reports', () => {
		const data = baseData();
		expect(canDeleteProject(data, 'p2').ok).toBe(true);
		const result = deleteProject(data, 'p2');
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.projects.some((p) => p.id === 'p2')).toBe(false);
	});
});

describe('report timestamps', () => {
	it('sets createdAt and updatedAt on create', () => {
		const now = new Date('2026-06-15T12:00:00.000Z');
		const { report } = createReport(
			baseData(),
			{
				projectId: 'p1',
				authorId: 'u1',
				reportingPeriod: '2026-06',
				overallStatus: 'Yellow',
				accomplishments: 'x',
				blockers: '',
				nextSteps: 'y'
			},
			now
		);
		expect(report.createdAt).toBe(now.toISOString());
		expect(report.updatedAt).toBe(now.toISOString());
	});

	it('bumps updatedAt but preserves createdAt on edit', () => {
		const later = new Date('2026-06-20T09:30:00.000Z');
		const { report } = updateReport(
			baseData(),
			'r1',
			{
				projectId: 'p1',
				authorId: 'u1',
				reportingPeriod: '2026-06',
				overallStatus: 'Red',
				accomplishments: 'changed',
				blockers: 'blocked',
				nextSteps: 'next'
			},
			later
		);
		expect(report.createdAt).toBe('2026-06-01T00:00:00.000Z');
		expect(report.updatedAt).toBe(later.toISOString());
		expect(report.overallStatus).toBe('Red');
	});

	it('always deletes a report', () => {
		const { data } = deleteReport(baseData(), 'r1');
		expect(data.reports).toHaveLength(0);
	});
});

describe('dashboardStats', () => {
	it('counts projects, active projects, and reports by status', () => {
		const stats = dashboardStats(baseData(), new Date(2026, 5, 15));
		expect(stats.totalProjects).toBe(2);
		expect(stats.activeProjects).toBe(1);
		expect(stats.green).toBe(1);
		expect(stats.yellow).toBe(0);
		expect(stats.red).toBe(0);
	});

	it('counts "this period" by reportingPeriod, not createdAt', () => {
		const data = baseData();
		// A report whose subject month is May but created in June.
		data.reports.push({
			id: 'r2',
			projectId: 'p1',
			authorId: 'u1',
			reportingPeriod: '2026-05',
			overallStatus: 'Yellow',
			accomplishments: 'a',
			blockers: '',
			nextSteps: 'n',
			createdAt: '2026-06-10T00:00:00.000Z',
			updatedAt: '2026-06-10T00:00:00.000Z'
		});
		const stats = dashboardStats(data, new Date(2026, 5, 15)); // June
		expect(stats.reportsThisPeriod).toBe(1); // only r1 (2026-06), not r2 (2026-05)
	});
});
