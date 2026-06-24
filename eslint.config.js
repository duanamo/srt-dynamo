import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: { parser: ts.parser }
		}
	},
	{
		rules: {
			// This template drives navigation from a config (navigationConfig holds
			// dynamic `path` strings), so links resolve a runtime value, not a literal
			// route id. SvelteKit's typed resolve() only types literal routes, so this
			// rule doesn't fit the config-driven pattern — off project-wide by design.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Vendored shadcn-svelte primitives — kept as upstream ships them. The
		// /styleguide route is a demo aid the README documents removing. Build
		// output and the SvelteKit cache are not source.
		ignores: [
			'build/',
			'.svelte-kit/',
			'dist/',
			'node_modules/',
			'src/lib/components/ui/',
			'src/routes/styleguide/'
		]
	}
);
