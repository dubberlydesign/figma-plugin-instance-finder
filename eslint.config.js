import js from '@eslint/js';
import globals from "globals";
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';
import sveltePlugin from 'eslint-plugin-svelte';
import * as figmaPlugin from '@figma/eslint-plugin-figma-plugins';

export default defineConfig([
	js.configs.recommended,
	...tseslint.configs.recommended,

	globalIgnores(['node_modules/**', 'dist/**', '*.config.{js,ts}', 'src/vite-env.d.ts']),

	// Base configuration
	{
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte'],
			},
		},
	},

	// Main thread specifics
	{
		files: ['src/main/**/*.ts'],
		languageOptions: {
			globals: { figma: 'readonly', __html__: 'readonly' },
		},
		plugins: {
			'@figma/figma-plugins': figmaPlugin,
		},
		rules: { '@typescript-eslint/triple-slash-reference': 'off' },
	},

	// UI thread specifics
	{
		files: ['src/ui/**/*.{ts,svelte}'],
		languageOptions: {
			globals: { ...globals.browser },
		},
		rules: { '@typescript-eslint/triple-slash-reference': 'off' },
	},

	// Svelte files
	{
		files: ['**/*.svelte'],
		plugins: { svelte: sveltePlugin },
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
			},
		},
	},
]);
