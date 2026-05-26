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
		client: {"start":"_app/immutable/entry/start.zvy_ANC2.js","app":"_app/immutable/entry/app.CdCYXT7S.js","imports":["_app/immutable/entry/start.zvy_ANC2.js","_app/immutable/chunks/Czxar0lz.js","_app/immutable/chunks/B6lgQfWG.js","_app/immutable/chunks/AwywQqV6.js","_app/immutable/entry/app.CdCYXT7S.js","_app/immutable/chunks/B6lgQfWG.js","_app/immutable/chunks/DBS4Dvjc.js","_app/immutable/chunks/AwywQqV6.js","_app/immutable/chunks/DnLKEd_Q.js","_app/immutable/chunks/DpynMDLe.js","_app/immutable/chunks/BZDukeKc.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
