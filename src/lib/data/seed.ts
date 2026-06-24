// Seed dataset, built fresh so cross-references use real generated ids. `now` is
// injected (STYLEGUIDE.md:245) so reporting periods are deterministic in tests
// and the current month is always populated in the app.

import {
	SCHEMA_VERSION,
	type AppData,
	type Project,
	type StatusReport,
	type User
} from '$lib/types';
import { periodOf } from './operations';

export function buildSeed(now: Date): AppData {
	const thisPeriod = periodOf(now);
	const lastPeriod = periodOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));
	const thisStamp = new Date(now.getFullYear(), now.getMonth(), 12).toISOString();
	const lastStamp = new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString();

	const user = (name: string, email: string, role: User['role']): User => ({
		id: crypto.randomUUID(),
		name,
		email,
		role
	});

	// 5 users, covering all roles. Dana owns nothing and authors nothing — the
	// deletable case for the referential-integrity rule.
	const maya = user('Maya Chen', 'maya.chen@dynamo.works', 'Developer');
	const liam = user('Liam O Brien', 'liam.obrien@dynamo.works', 'Developer');
	const priya = user('Priya Patel', 'priya.patel@dynamo.works', 'Project Manager');
	const marcus = user('Marcus Reed', 'marcus.reed@dynamo.works', 'Executive');
	const dana = user('Dana Holt', 'dana.holt@dynamo.works', 'Executive');
	const users = [maya, liam, priya, marcus, dana];

	const project = (
		name: string,
		description: string,
		status: Project['status'],
		ownerId: string
	): Project => ({ id: crypto.randomUUID(), name, description, status, ownerId });

	// 4 projects, one per status. Delta has no reports — the deletable project.
	const apollo = project(
		'Apollo Dashboard',
		'Internal analytics dashboard for the operations team.',
		'Active',
		maya.id
	);
	const borealis = project(
		'Borealis Migration',
		'Migrate the legacy reporting service to the new platform.',
		'At Risk',
		priya.id
	);
	const cobalt = project(
		'Cobalt Reporting',
		'Quarterly compliance reporting automation.',
		'Complete',
		marcus.id
	);
	const delta = project(
		'Delta Onboarding',
		'Employee onboarding portal, paused pending design review.',
		'On Hold',
		liam.id
	);
	const projects = [apollo, borealis, cobalt, delta];

	const report = (
		projectId: string,
		authorId: string,
		reportingPeriod: string,
		overallStatus: StatusReport['overallStatus'],
		accomplishments: string,
		blockers: string,
		nextSteps: string,
		stamp: string
	): StatusReport => ({
		id: crypto.randomUUID(),
		projectId,
		authorId,
		reportingPeriod,
		overallStatus,
		accomplishments,
		blockers,
		nextSteps,
		createdAt: stamp,
		updatedAt: stamp
	});

	// 8 reports: 5 in the current period, 3 in the previous. Multiple authors and
	// projects; all three overall statuses appear. Delta and Dana are never
	// referenced. Apollo/Maya are referenced both ways (blocked-deletion case).
	const reports: StatusReport[] = [
		report(
			apollo.id,
			maya.id,
			thisPeriod,
			'Green',
			'Shipped the new filter bar and cut p95 load time by 30%.',
			'',
			'Add saved views and start the export feature.',
			thisStamp
		),
		report(
			apollo.id,
			liam.id,
			thisPeriod,
			'Yellow',
			'Wired up the export endpoint behind a flag.',
			'Waiting on design sign-off for the export modal.',
			'Finalize the modal and enable for the pilot team.',
			thisStamp
		),
		report(
			borealis.id,
			priya.id,
			thisPeriod,
			'Red',
			'Completed the data audit for the first two services.',
			'Source schema drift is larger than scoped; timeline at risk.',
			'Re-scope the migration window with stakeholders.',
			thisStamp
		),
		report(
			cobalt.id,
			marcus.id,
			thisPeriod,
			'Green',
			'Automated the Q2 compliance export end to end.',
			'',
			'Hand off the runbook and close the project.',
			thisStamp
		),
		report(
			borealis.id,
			maya.id,
			thisPeriod,
			'Yellow',
			'Prototyped the schema-mapping tool.',
			'Needs a review from the platform team.',
			'Incorporate review feedback and add tests.',
			thisStamp
		),
		report(
			apollo.id,
			maya.id,
			lastPeriod,
			'Green',
			'Delivered the initial dashboard layout and KPI cards.',
			'',
			'Begin work on filtering.',
			lastStamp
		),
		report(
			borealis.id,
			priya.id,
			lastPeriod,
			'Red',
			'Kicked off discovery and inventoried the legacy endpoints.',
			'Access to the legacy database was delayed two weeks.',
			'Start the data audit once access lands.',
			lastStamp
		),
		report(
			cobalt.id,
			marcus.id,
			lastPeriod,
			'Yellow',
			'Drafted the compliance export format.',
			'Pending confirmation of the required fields.',
			'Confirm fields and implement the exporter.',
			lastStamp
		)
	];

	return { version: SCHEMA_VERSION, users, projects, reports };
}
