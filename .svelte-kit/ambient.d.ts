
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const npm_package_scripts_test_visual: string;
	export const npm_package_scripts_test_e2e: string;
	export const __MISE_DIFF: string;
	export const npm_package_devDependencies_typescript_eslint: string;
	export const NODE: string;
	export const INIT_CWD: string;
	export const npm_package_devDependencies_typescript: string;
	export const npm_config_version_git_tag: string;
	export const ASDF_DIR: string;
	export const TERM: string;
	export const SHELL: string;
	export const npm_package_devDependencies_vite: string;
	export const HOMEBREW_REPOSITORY: string;
	export const TMPDIR: string;
	export const npm_package_scripts_lint: string;
	export const npm_config_init_license: string;
	export const FPATH: string;
	export const npm_package_scripts_dev: string;
	export const ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
	export const TERM_SESSION_ID: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_package_private: string;
	export const npm_config_registry: string;
	export const npm_package_readmeFilename: string;
	export const npm_package_devDependencies_globals: string;
	export const USER: string;
	export const npm_package_description: string;
	export const npm_package_devDependencies__eslint_js: string;
	export const COMMAND_MODE: string;
	export const npm_package_scripts_deploy: string;
	export const npm_package_devDependencies__sveltejs_adapter_static: string;
	export const SSH_AUTH_SOCK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_package_devDependencies_eslint: string;
	export const npm_execpath: string;
	export const npm_package_scripts_predeploy: string;
	export const GO111MODULE: string;
	export const npm_package_devDependencies__testing_library_svelte: string;
	export const PATH: string;
	export const npm_config_argv: string;
	export const TERMINAL_EMULATOR: string;
	export const _: string;
	export const __CFBundleIdentifier: string;
	export const PWD: string;
	export const npm_package_scripts_preview: string;
	export const GOFLAGS: string;
	export const npm_lifecycle_event: string;
	export const npm_package_devDependencies_jsdom: string;
	export const ASDF_CONFIG_FILE: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_name: string;
	export const npm_package_scripts_build: string;
	export const npm_config_version_commit_hooks: string;
	export const XPC_FLAGS: string;
	export const npm_package_devDependencies_vitest: string;
	export const npm_config_bin_links: string;
	export const FORCE_COLOR: string;
	export const npm_config_wrap_output: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_package_version: string;
	export const DEBUG_COLORS: string;
	export const SHLVL: string;
	export const HOME: string;
	export const npm_package_type: string;
	export const __MISE_ORIG_PATH: string;
	export const npm_package_scripts_test: string;
	export const npm_config_save_prefix: string;
	export const npm_config_strict_ssl: string;
	export const HOMEBREW_PREFIX: string;
	export const npm_config_version_git_message: string;
	export const ASDF_DATA_DIR: string;
	export const MISE_SHELL: string;
	export const LOGNAME: string;
	export const YARN_WRAP_OUTPUT: string;
	export const PREFIX: string;
	export const npm_lifecycle_script: string;
	export const npm_package_devDependencies_gh_pages: string;
	export const npm_package_dependencies_svelte: string;
	export const LC_CTYPE: string;
	export const BROWSER: string;
	export const npm_package_devDependencies__testing_library_dom: string;
	export const npm_config_version_git_sign: string;
	export const npm_config_ignore_scripts: string;
	export const npm_config_user_agent: string;
	export const PLAYWRIGHT_TEST: string;
	export const __MISE_SESSION: string;
	export const INFOPATH: string;
	export const HOMEBREW_CELLAR: string;
	export const npm_package_devDependencies__types_node: string;
	export const npm_package_devDependencies__playwright_test: string;
	export const npm_config_init_version: string;
	export const npm_config_ignore_optional: string;
	export const __MISE_ZSH_PRECMD_RUN: string;
	export const GH_TOKEN: string;
	export const npm_node_execpath: string;
	export const npm_config_version_tag_prefix: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		npm_package_scripts_test_visual: string;
		npm_package_scripts_test_e2e: string;
		__MISE_DIFF: string;
		npm_package_devDependencies_typescript_eslint: string;
		NODE: string;
		INIT_CWD: string;
		npm_package_devDependencies_typescript: string;
		npm_config_version_git_tag: string;
		ASDF_DIR: string;
		TERM: string;
		SHELL: string;
		npm_package_devDependencies_vite: string;
		HOMEBREW_REPOSITORY: string;
		TMPDIR: string;
		npm_package_scripts_lint: string;
		npm_config_init_license: string;
		FPATH: string;
		npm_package_scripts_dev: string;
		ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
		TERM_SESSION_ID: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_package_private: string;
		npm_config_registry: string;
		npm_package_readmeFilename: string;
		npm_package_devDependencies_globals: string;
		USER: string;
		npm_package_description: string;
		npm_package_devDependencies__eslint_js: string;
		COMMAND_MODE: string;
		npm_package_scripts_deploy: string;
		npm_package_devDependencies__sveltejs_adapter_static: string;
		SSH_AUTH_SOCK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_package_devDependencies_eslint: string;
		npm_execpath: string;
		npm_package_scripts_predeploy: string;
		GO111MODULE: string;
		npm_package_devDependencies__testing_library_svelte: string;
		PATH: string;
		npm_config_argv: string;
		TERMINAL_EMULATOR: string;
		_: string;
		__CFBundleIdentifier: string;
		PWD: string;
		npm_package_scripts_preview: string;
		GOFLAGS: string;
		npm_lifecycle_event: string;
		npm_package_devDependencies_jsdom: string;
		ASDF_CONFIG_FILE: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_name: string;
		npm_package_scripts_build: string;
		npm_config_version_commit_hooks: string;
		XPC_FLAGS: string;
		npm_package_devDependencies_vitest: string;
		npm_config_bin_links: string;
		FORCE_COLOR: string;
		npm_config_wrap_output: string;
		XPC_SERVICE_NAME: string;
		npm_package_version: string;
		DEBUG_COLORS: string;
		SHLVL: string;
		HOME: string;
		npm_package_type: string;
		__MISE_ORIG_PATH: string;
		npm_package_scripts_test: string;
		npm_config_save_prefix: string;
		npm_config_strict_ssl: string;
		HOMEBREW_PREFIX: string;
		npm_config_version_git_message: string;
		ASDF_DATA_DIR: string;
		MISE_SHELL: string;
		LOGNAME: string;
		YARN_WRAP_OUTPUT: string;
		PREFIX: string;
		npm_lifecycle_script: string;
		npm_package_devDependencies_gh_pages: string;
		npm_package_dependencies_svelte: string;
		LC_CTYPE: string;
		BROWSER: string;
		npm_package_devDependencies__testing_library_dom: string;
		npm_config_version_git_sign: string;
		npm_config_ignore_scripts: string;
		npm_config_user_agent: string;
		PLAYWRIGHT_TEST: string;
		__MISE_SESSION: string;
		INFOPATH: string;
		HOMEBREW_CELLAR: string;
		npm_package_devDependencies__types_node: string;
		npm_package_devDependencies__playwright_test: string;
		npm_config_init_version: string;
		npm_config_ignore_optional: string;
		__MISE_ZSH_PRECMD_RUN: string;
		GH_TOKEN: string;
		npm_node_execpath: string;
		npm_config_version_tag_prefix: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
