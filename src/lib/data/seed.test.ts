import { describe, it, expect } from 'vitest';
import { ROLES, PROJECT_STATUSES } from '$lib/types';
import { buildSeed } from './seed';
import { canDeleteProject, canDeleteUser, periodOf } from './operations';

const NOW = new Date(2026, 5, 15); // June 2026

describe('buildSeed', () => {
	const data = buildSeed(NOW);

	it('covers all roles across at least five users', () => {
		expect(data.users.length).toBeGreaterThanOrEqual(5);
		for (const role of ROLES) {
			expect(data.users.some((u) => u.role === role)).toBe(true);
		}
	});

	it('has exactly one project per status', () => {
		expect([...data.projects].map((p) => p.status).sort()).toEqual([...PROJECT_STATUSES].sort());
	});

	it('spreads reports across at least two periods, including the current one', () => {
		const periods = new Set(data.reports.map((r) => r.reportingPeriod));
		expect(periods.size).toBeGreaterThanOrEqual(2);
		expect(data.reports.some((r) => r.reportingPeriod === periodOf(NOW))).toBe(true);
	});

	it('includes all three overall statuses', () => {
		const statuses = new Set(data.reports.map((r) => r.overallStatus));
		expect(statuses).toEqual(new Set(['Green', 'Yellow', 'Red']));
	});

	it('is referentially valid — every reference points at an existing record', () => {
		const userIds = new Set(data.users.map((u) => u.id));
		const projectIds = new Set(data.projects.map((p) => p.id));
		expect(data.projects.every((p) => userIds.has(p.ownerId))).toBe(true);
		expect(data.reports.every((r) => projectIds.has(r.projectId) && userIds.has(r.authorId))).toBe(
			true
		);
	});

	it('makes the deletion rule demonstrable both ways', () => {
		// At least one user/project is referenced (blocked) and at least one is not (allowed).
		expect(data.users.some((u) => !canDeleteUser(data, u.id).ok)).toBe(true);
		expect(data.users.some((u) => canDeleteUser(data, u.id).ok)).toBe(true);
		expect(data.projects.some((p) => !canDeleteProject(data, p.id).ok)).toBe(true);
		expect(data.projects.some((p) => canDeleteProject(data, p.id).ok)).toBe(true);
	});
});
