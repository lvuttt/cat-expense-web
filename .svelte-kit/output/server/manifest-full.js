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
		client: {"start":"_app/immutable/entry/start.BPBmTVMz.js","app":"_app/immutable/entry/app.DS47o5zt.js","imports":["_app/immutable/entry/start.BPBmTVMz.js","_app/immutable/chunks/ulyaGrnx.js","_app/immutable/chunks/uabSowo-.js","_app/immutable/chunks/B3X8v697.js","_app/immutable/entry/app.DS47o5zt.js","_app/immutable/chunks/B3X8v697.js","_app/immutable/chunks/xihTtKlq.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
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
