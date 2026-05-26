import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.ar5S_rXI.js","_app/immutable/chunks/DnLKEd_Q.js","_app/immutable/chunks/B6lgQfWG.js","_app/immutable/chunks/BZDukeKc.js"];
export const stylesheets = ["_app/immutable/assets/0.CYhjl5Hi.css"];
export const fonts = [];
