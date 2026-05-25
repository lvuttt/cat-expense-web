import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C7DfYSxt.js","_app/immutable/chunks/aTSsEHjK.js","_app/immutable/chunks/B7FE4J8T.js","_app/immutable/chunks/BaO9FkzU.js"];
export const stylesheets = ["_app/immutable/assets/0.CSZTWjNz.css"];
export const fonts = [];
