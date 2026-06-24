// Pure validation. Each validator returns a field → message map; an empty map
// means valid. This drives inline form errors and is unit-testable on its own.

import {
	OVERALL_STATUSES,
	PROJECT_STATUSES,
	ROLES,
	type AppData,
	type ProjectInput,
	type ReportInput,
	type UserInput,
	type ValidationErrors
} from '$lib/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValid(errors: ValidationErrors): boolean {
	return Object.keys(errors).length === 0;
}

export function validateUser(input: UserInput): ValidationErrors {
	const errors: ValidationErrors = {};
	if (!input.name.trim()) errors.name = 'Name is required.';
	if (!input.email.trim()) errors.email = 'Email is required.';
	else if (!EMAIL_RE.test(input.email.trim())) errors.email = 'Enter a valid email address.';
	if (!ROLES.includes(input.role)) errors.role = 'Select a role.';
	return errors;
}

export function validateProject(input: ProjectInput, data: AppData): ValidationErrors {
	const errors: ValidationErrors = {};
	if (!input.name.trim()) errors.name = 'Name is required.';
	if (!PROJECT_STATUSES.includes(input.status)) errors.status = 'Select a status.';
	if (!input.ownerId) errors.ownerId = 'Select an owner.';
	else if (!data.users.some((u) => u.id === input.ownerId))
		errors.ownerId = 'Selected owner no longer exists.';
	return errors;
}

export function validateReport(input: ReportInput, data: AppData): ValidationErrors {
	const errors: ValidationErrors = {};
	if (!input.projectId) errors.projectId = 'Select a project.';
	else if (!data.projects.some((p) => p.id === input.projectId))
		errors.projectId = 'Selected project no longer exists.';
	if (!input.authorId) errors.authorId = 'Select an author.';
	else if (!data.users.some((u) => u.id === input.authorId))
		errors.authorId = 'Selected author no longer exists.';
	if (!PERIOD_RE.test(input.reportingPeriod))
		errors.reportingPeriod = 'Use a month in YYYY-MM format.';
	if (!OVERALL_STATUSES.includes(input.overallStatus))
		errors.overallStatus = 'Select an overall status.';
	if (!input.accomplishments.trim()) errors.accomplishments = 'Accomplishments are required.';
	if (!input.nextSteps.trim()) errors.nextSteps = 'Next steps are required.';
	return errors;
}
