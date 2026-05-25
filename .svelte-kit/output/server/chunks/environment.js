//#region \0virtual:__sveltekit/paths
var base = "";
var assets = base;
var initial = {
	base,
	assets
};
function override(paths) {
	base = paths.base;
	assets = paths.assets;
}
function reset() {
	base = initial.base;
	assets = initial.assets;
}
/** @param {string} path */
function set_assets(path) {
	assets = initial.assets = path;
}
//#endregion
//#region \0virtual:__sveltekit/environment
var version = "1779724365489";
var prerendering = false;
function set_building() {}
function set_prerendering() {
	prerendering = true;
}
//#endregion
export { assets as a, reset as c, version as i, set_assets as l, set_building as n, base as o, set_prerendering as r, override as s, prerendering as t };
