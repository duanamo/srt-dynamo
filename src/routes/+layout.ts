import { env } from '$env/dynamic/public';
import type { LayoutLoad } from './$types';
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
				global: {
					fetch
				}
			})
		: createServerClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	// Use the session from the server layout (already validated via safeGetSession)
	// instead of calling getSession() again on the client, which can trigger cookie
	// changes and cause an invalidation loop.
	const session = data.session ?? null;

	return { supabase, session };
};
