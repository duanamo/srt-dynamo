import { describe, it, expect } from 'vitest';
import type { AppData } from '$lib/types';
import { isValid, validateProject, validateReport, validateUser } from './validation';

function data(): AppData {
	return {
		version: 1,
		users: [{ id: 'u1', name: 'Owner', email: 'o@example.com', role: 'Developer' }],
		projects: [{ id: 'p1', name: 'Proj', description: '', status: 'Active', ownerId: 'u1' }],
		reports: []
	};
}

describe('validateUser', () => {
	it('passes a well-formed user', () => {
		expect(
			isValid(validateUser({ name: 'Jane', email: 'jane@example.com', role: 'Developer' }))
		).toBe(true);
	});

	it('requires a name', () => {
		expect(
			validateUser({ name: '  ', email: 'jane@example.com', role: 'Developer' }).name
		).toBeTruthy();
	});

	it('rejects a malformed email', () => {
		expect(
			validateUser({ name: 'Jane', email: 'not-an-email', role: 'Developer' }).email
		).toBeTruthy();
	});

	it('rejects an invalid role', () => {
		const input = { name: 'Jane', email: 'jane@example.com', role: 'Wizard' };
		// @ts-expect-error — role is intentionally not a valid Role
		expect(validateUser(input).role).toBeTruthy();
	});
});

describe('validateProject', () => {
	it('passes a well-formed project', () => {
		const errors = validateProject(
			{ name: 'Apollo', description: '', status: 'Active', ownerId: 'u1' },
			data()
		);
		expect(isValid(errors)).toBe(true);
	});

	it('requires an owner that exists', () => {
		const errors = validateProject(
			{ name: 'Apollo', description: '', status: 'Active', ownerId: 'ghost' },
			data()
		);
		expect(errors.ownerId).toBeTruthy();
	});

	it('requires a name and a valid status', () => {
		const input = { name: '', description: '', status: 'Nope', ownerId: 'u1' };
		// @ts-expect-error — status is intentionally invalid
		const errors = validateProject(input, data());
		expect(errors.name).toBeTruthy();
		expect(errors.status).toBeTruthy();
	});
});

describe('validateReport', () => {
	const valid = {
		projectId: 'p1',
		authorId: 'u1',
		reportingPeriod: '2026-06',
		overallStatus: 'Green' as const,
		accomplishments: 'Did things',
		blockers: '',
		nextSteps: 'Do more'
	};

	it('passes a well-formed report (blockers may be empty)', () => {
		expect(isValid(validateReport(valid, data()))).toBe(true);
	});

	it('requires project and author ids that exist', () => {
		const errors = validateReport({ ...valid, projectId: 'ghost', authorId: 'ghost' }, data());
		expect(errors.projectId).toBeTruthy();
		expect(errors.authorId).toBeTruthy();
	});

	it('rejects a malformed reporting period', () => {
		expect(
			validateReport({ ...valid, reportingPeriod: '2026/6' }, data()).reportingPeriod
		).toBeTruthy();
		expect(
			validateReport({ ...valid, reportingPeriod: '2026-13' }, data()).reportingPeriod
		).toBeTruthy();
	});

	it('requires accomplishments and next steps', () => {
		const errors = validateReport({ ...valid, accomplishments: '', nextSteps: '  ' }, data());
		expect(errors.accomplishments).toBeTruthy();
		expect(errors.nextSteps).toBeTruthy();
	});
});
