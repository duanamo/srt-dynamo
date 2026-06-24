// A single transient message shown after create/update/delete actions. Kept
// minimal — one reactive slot the (app) layout renders and auto-dismisses.

type Flash = { kind: 'success' | 'error'; text: string };

let current = $state<Flash | null>(null);

/** A singleton reactive slot holding the current transient flash message (or null). */
export const flash = {
	get current() {
		return current;
	},
	show(kind: Flash['kind'], text: string) {
		current = { kind, text };
	},
	clear() {
		current = null;
	}
};
