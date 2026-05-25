export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {"start":"_app/immutable/entry/start.CNywJzeA.js","app":"_app/immutable/entry/app.tLEcnNsV.js","imports":["_app/immutable/entry/start.CNywJzeA.js","_app/immutable/chunks/BiDptrUx.js","_app/immutable/chunks/B7FE4J8T.js","_app/immutable/entry/app.tLEcnNsV.js","_app/immutable/chunks/B7FE4J8T.js","_app/immutable/chunks/DcgVPje-.js","_app/immutable/chunks/aTSsEHjK.js","_app/immutable/chunks/BaO9FkzU.js","_app/immutable/chunks/bX2reijF.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
