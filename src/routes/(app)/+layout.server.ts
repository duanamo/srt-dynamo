import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Server-trusted guard for the authenticated (app) route group. The sibling
// universal +layout.ts guard covers client-side navigation; this is its server
// half, so an unauthenticated request to an (app) route is redirected before the
// page renders rather than relying on the client.
//
// Reuses the session the root +layout.server.ts already validated via
// safeGetSession() (getUser() against Supabase) — no second round-trip.
//
// Note: server load functions for a route run in parallel, so a +page.server.ts
// data loader is not *guaranteed* to be skipped by this redirect. Row-Level
// Security is the authoritative data protection (see supabase/migrations) — this
// guard is defense in depth and correct UX, not a substitute for RLS.
export const load: LayoutServerLoad = async ({ parent }) => {
	const { session } = await parent();

	if (!session) {
		redirect(307, '/login');
	}
};
