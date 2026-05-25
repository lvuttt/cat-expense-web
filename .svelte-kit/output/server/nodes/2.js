

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.DHxkoRbC.js","_app/immutable/chunks/B3X8v697.js","_app/immutable/chunks/xihTtKlq.js","_app/immutable/chunks/Ca-wiM1s.js"];
export const stylesheets = ["_app/immutable/assets/2.COCiP2__.css"];
export const fonts = [];
