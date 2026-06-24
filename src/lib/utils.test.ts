import { describe, it, expect } from 'vitest';
import { cn } from './utils';

// cn() exists to resolve Tailwind class conflicts via tailwind-merge after
// clsx flattens conditionals — these assert the behaviour that justifies it,
// not just that the function returns a string.
describe('cn', () => {
	it('joins distinct classes', () => {
		expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm');
	});

	it('lets the later Tailwind utility win on conflict', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
	});

	it('drops falsey values', () => {
		expect(cn('px-2', false, null, undefined, 'text-sm')).toBe('px-2 text-sm');
	});
});
