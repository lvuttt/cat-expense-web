import { a as assets, c as reset, o as base, s as override, t as prerendering } from "./chunks/environment.js";
import { C as get_status, D as Redirect, E as HttpError, O as SvelteKitError, S as get_message, T as ActionFailure, _ as normalize_path, b as compact, c as INVALIDATED_PARAM, d as add_data_suffix, f as decode_params, g as make_trackable, h as has_data_suffix, l as TRAILING_SLASH_PARAM, m as disable_search, o as hash, p as decode_pathname, s as b64_encode, v as resolve, w as normalize_error, x as coalesce_to_error, y as strip_data_suffix } from "./chunks/exports.js";
import { a as set_read_implementation, c as set_private_env, i as set_manifest, l as set_public_env, n as options, o as public_env, r as read_implementation, s as safe_public_env, t as get_hooks, u as set_safe_public_env } from "./chunks/internal.js";
import { _ as writable, g as readable } from "./chunks/index-server.js";
import * as devalue from "devalue";
import { parse, serialize } from "cookie";
import * as set_cookie_parser from "set-cookie-parser";
var ENDPOINT_METHODS = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
	"HEAD"
];
var PAGE_METHODS = [
	"GET",
	"POST",
	"HEAD"
];
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/http.js
/**
* Given an Accept header and a list of possible content types, pick
* the most suitable one to respond with
* @param {string} accept
* @param {string[]} types
*/
function negotiate(accept, types) {
	/** @type {Array<{ type: string, subtype: string, q: number, i: number }>} */
	const parts = [];
	accept.split(",").forEach((str, i) => {
		const match = /([^/ \t]+)\/([^; \t]+)[ \t]*(?:;[ \t]*q=([0-9.]+))?/.exec(str);
		if (match) {
			const [, type, subtype, q = "1"] = match;
			parts.push({
				type,
				subtype,
				q: +q,
				i
			});
		}
	});
	parts.sort((a, b) => {
		if (a.q !== b.q) return b.q - a.q;
		if (a.subtype === "*" !== (b.subtype === "*")) return a.subtype === "*" ? 1 : -1;
		if (a.type === "*" !== (b.type === "*")) return a.type === "*" ? 1 : -1;
		return a.i - b.i;
	});
	let accepted;
	let min_priority = Infinity;
	for (const mimetype of types) {
		const [type, subtype] = mimetype.split("/");
		const priority = parts.findIndex((part) => (part.type === type || part.type === "*") && (part.subtype === subtype || part.subtype === "*"));
		if (priority !== -1 && priority < min_priority) {
			accepted = mimetype;
			min_priority = priority;
		}
	}
	return accepted;
}
/**
* Returns `true` if the request contains a `content-type` header with the given type
* @param {Request} request
* @param  {...string} types
*/
function is_content_type(request, ...types) {
	const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
	return types.includes(type.toLowerCase());
}
/**
* @param {Request} request
*/
function is_form_content_type(request) {
	return is_content_type(request, "application/x-www-form-urlencoded", "multipart/form-data", "text/plain");
}
//#endregion
//#region node_modules/@sveltejs/kit/src/exports/index.js
/**
* Create a JSON `Response` object from the supplied data.
* @param {any} data The value that will be serialized as JSON.
* @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. `Content-Type: application/json` and `Content-Length` headers will be added automatically.
*/
function json(data, init) {
	const body = JSON.stringify(data);
	const headers = new Headers(init?.headers);
	if (!headers.has("content-length")) headers.set("content-length", encoder$3.encode(body).byteLength.toString());
	if (!headers.has("content-type")) headers.set("content-type", "application/json");
	return new Response(body, {
		...init,
		headers
	});
}
var encoder$3 = new TextEncoder();
/**
* Create a `Response` object from the supplied body.
* @param {string} body The value that will be used as-is.
* @param {ResponseInit} [init] Options such as `status` and `headers` that will be added to the response. A `Content-Length` header will be added automatically.
*/
function text(body, init) {
	const headers = new Headers(init?.headers);
	if (!headers.has("content-length")) {
		const encoded = encoder$3.encode(body);
		headers.set("content-length", encoded.byteLength.toString());
		return new Response(encoded, {
			...init,
			headers
		});
	}
	return new Response(body, {
		...init,
		headers
	});
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/escape.js
/**
* When inside a double-quoted attribute value, only `&` and `"` hold special meaning.
* @see https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state
* @type {Record<string, string>}
*/
var escape_html_attr_dict = {
	"&": "&amp;",
	"\"": "&quot;"
};
/**
* @type {Record<string, string>}
*/
var escape_html_dict = {
	"&": "&amp;",
	"<": "&lt;"
};
var escape_html_attr_regex = new RegExp(`[${Object.keys(escape_html_attr_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
var escape_html_regex = new RegExp(`[${Object.keys(escape_html_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
/**
* Escapes unpaired surrogates (which are allowed in js strings but invalid in HTML) and
* escapes characters that are special.
*
* @param {string} str
* @param {boolean} [is_attr]
* @returns {string} escaped string
* @example const html = `<tag data-value="${escape_html('value', true)}">...</tag>`;
*/
function escape_html(str, is_attr) {
	const dict = is_attr ? escape_html_attr_dict : escape_html_dict;
	return str.replace(is_attr ? escape_html_attr_regex : escape_html_regex, (match) => {
		if (match.length === 2) return match;
		return dict[match] ?? `&#${match.charCodeAt(0)};`;
	});
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/utils.js
/**
* @param {Partial<Record<import('types').HttpMethod, any>>} mod
* @param {import('types').HttpMethod} method
*/
function method_not_allowed(mod, method) {
	return text(`${method} method not allowed`, {
		status: 405,
		headers: { allow: allowed_methods(mod).join(", ") }
	});
}
/** @param {Partial<Record<import('types').HttpMethod, any>>} mod */
function allowed_methods(mod) {
	const allowed = ENDPOINT_METHODS.filter((method) => method in mod);
	if ("GET" in mod || "HEAD" in mod) allowed.push("HEAD");
	return allowed;
}
/**
* Return as a response that renders the error.html
*
* @param {import('types').SSROptions} options
* @param {number} status
* @param {string} message
*/
function static_error_page(options, status, message) {
	return text(options.templates.error({
		status,
		message: escape_html(message)
	}), {
		headers: { "content-type": "text/html; charset=utf-8" },
		status
	});
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSROptions} options
* @param {unknown} error
*/
async function handle_fatal_error(event, options, error) {
	error = error instanceof HttpError ? error : coalesce_to_error(error);
	const status = get_status(error);
	const body = await handle_error_and_jsonify(event, options, error);
	const type = negotiate(event.request.headers.get("accept") || "text/html", ["application/json", "text/html"]);
	if (event.isDataRequest || type === "application/json") return json(body, { status });
	return static_error_page(options, status, body.message);
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSROptions} options
* @param {any} error
* @returns {Promise<App.Error>}
*/
async function handle_error_and_jsonify(event, options, error) {
	if (error instanceof HttpError) return error.body;
	const status = get_status(error);
	const message = get_message(error);
	return await options.hooks.handleError({
		error,
		event,
		status,
		message
	}) ?? { message };
}
/**
* @param {number} status
* @param {string} location
*/
function redirect_response(status, location) {
	return new Response(void 0, {
		status,
		headers: { location }
	});
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {Error & { path: string }} error
*/
function clarify_devalue_error(event, error) {
	if (error.path) return `Data returned from \`load\` while rendering ${event.route.id} is not serializable: ${error.message} (data${error.path})`;
	if (error.path === "") return `Data returned from \`load\` while rendering ${event.route.id} is not a plain object`;
	return error.message;
}
/**
* @param {import('types').ServerDataNode} node
*/
function stringify_uses(node) {
	const uses = [];
	if (node.uses && node.uses.dependencies.size > 0) uses.push(`"dependencies":${JSON.stringify(Array.from(node.uses.dependencies))}`);
	if (node.uses && node.uses.search_params.size > 0) uses.push(`"search_params":${JSON.stringify(Array.from(node.uses.search_params))}`);
	if (node.uses && node.uses.params.size > 0) uses.push(`"params":${JSON.stringify(Array.from(node.uses.params))}`);
	if (node.uses?.parent) uses.push("\"parent\":1");
	if (node.uses?.route) uses.push("\"route\":1");
	if (node.uses?.url) uses.push("\"url\":1");
	return `"uses":{${uses.join(",")}}`;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/endpoint.js
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSREndpoint} mod
* @param {import('types').SSRState} state
* @returns {Promise<Response>}
*/
async function render_endpoint(event, mod, state) {
	const method = event.request.method;
	let handler = mod[method] || mod.fallback;
	if (method === "HEAD" && mod.GET && !mod.HEAD) handler = mod.GET;
	if (!handler) return method_not_allowed(mod, method);
	const prerender = mod.prerender ?? state.prerender_default;
	if (prerender && (mod.POST || mod.PATCH || mod.PUT || mod.DELETE)) throw new Error("Cannot prerender endpoints that have mutative methods");
	if (state.prerendering && !prerender) if (state.depth > 0) throw new Error(`${event.route.id} is not prerenderable`);
	else return new Response(void 0, { status: 204 });
	try {
		let response = await handler(event);
		if (!(response instanceof Response)) throw new Error(`Invalid response from route ${event.url.pathname}: handler should return a Response object`);
		if (state.prerendering) {
			response = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: new Headers(response.headers)
			});
			response.headers.set("x-sveltekit-prerender", String(prerender));
		}
		return response;
	} catch (e) {
		if (e instanceof Redirect) return new Response(void 0, {
			status: e.status,
			headers: { location: e.location }
		});
		throw e;
	}
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
*/
function is_endpoint_request(event) {
	const { method, headers } = event.request;
	if (ENDPOINT_METHODS.includes(method) && !PAGE_METHODS.includes(method)) return true;
	if (method === "POST" && headers.get("x-sveltekit-action") === "true") return false;
	return negotiate(event.request.headers.get("accept") ?? "*/*", ["*", "text/html"]) !== "text/html";
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/actions.js
/** @param {import('@sveltejs/kit').RequestEvent} event */
function is_action_json_request(event) {
	return negotiate(event.request.headers.get("accept") ?? "*/*", ["application/json", "text/html"]) === "application/json" && event.request.method === "POST";
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSROptions} options
* @param {import('types').SSRNode['server'] | undefined} server
*/
async function handle_action_json_request(event, options, server) {
	const actions = server?.actions;
	if (!actions) {
		const no_actions_error = new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`);
		return action_json({
			type: "error",
			error: await handle_error_and_jsonify(event, options, no_actions_error)
		}, {
			status: no_actions_error.status,
			headers: { allow: "GET" }
		});
	}
	check_named_default_separate(actions);
	try {
		const data = await call_action(event, actions);
		if (data instanceof ActionFailure) return action_json({
			type: "failure",
			status: data.status,
			data: stringify_action_response(data.data, event.route.id, options.hooks.transport)
		});
		else return action_json({
			type: "success",
			status: data ? 200 : 204,
			data: stringify_action_response(data, event.route.id, options.hooks.transport)
		});
	} catch (e) {
		const err = normalize_error(e);
		if (err instanceof Redirect) return action_json_redirect(err);
		return action_json({
			type: "error",
			error: await handle_error_and_jsonify(event, options, check_incorrect_fail_use(err))
		}, { status: get_status(err) });
	}
}
/**
* @param {HttpError | Error} error
*/
function check_incorrect_fail_use(error) {
	return error instanceof ActionFailure ? /* @__PURE__ */ new Error("Cannot \"throw fail()\". Use \"return fail()\"") : error;
}
/**
* @param {import('@sveltejs/kit').Redirect} redirect
*/
function action_json_redirect(redirect) {
	return action_json({
		type: "redirect",
		status: redirect.status,
		location: redirect.location
	});
}
/**
* @param {import('@sveltejs/kit').ActionResult} data
* @param {ResponseInit} [init]
*/
function action_json(data, init) {
	return json(data, init);
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
*/
function is_action_request(event) {
	return event.request.method === "POST";
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSRNode['server'] | undefined} server
* @returns {Promise<import('@sveltejs/kit').ActionResult>}
*/
async function handle_action_request(event, server) {
	const actions = server?.actions;
	if (!actions) {
		event.setHeaders({ allow: "GET" });
		return {
			type: "error",
			error: new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`)
		};
	}
	check_named_default_separate(actions);
	try {
		const data = await call_action(event, actions);
		if (data instanceof ActionFailure) return {
			type: "failure",
			status: data.status,
			data: data.data
		};
		else return {
			type: "success",
			status: 200,
			data
		};
	} catch (e) {
		const err = normalize_error(e);
		if (err instanceof Redirect) return {
			type: "redirect",
			status: err.status,
			location: err.location
		};
		return {
			type: "error",
			error: check_incorrect_fail_use(err)
		};
	}
}
/**
* @param {import('@sveltejs/kit').Actions} actions
*/
function check_named_default_separate(actions) {
	if (actions.default && Object.keys(actions).length > 1) throw new Error("When using named actions, the default action cannot be used. See the docs for more info: https://svelte.dev/docs/kit/form-actions#named-actions");
}
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {NonNullable<import('types').SSRNode['server']['actions']>} actions
* @throws {Redirect | HttpError | SvelteKitError | Error}
*/
async function call_action(event, actions) {
	const url = new URL(event.request.url);
	let name = "default";
	for (const param of url.searchParams) if (param[0].startsWith("/")) {
		name = param[0].slice(1);
		if (name === "default") throw new Error("Cannot use reserved action name \"default\"");
		break;
	}
	const action = actions[name];
	if (!action) throw new SvelteKitError(404, "Not Found", `No action with name '${name}' found`);
	if (!is_form_content_type(event.request)) throw new SvelteKitError(415, "Unsupported Media Type", `Form actions expect form-encoded data — received ${event.request.headers.get("content-type")}`);
	return action(event);
}
/**
* Try to `devalue.uneval` the data object, and if it fails, return a proper Error with context
* @param {any} data
* @param {string} route_id
* @param {import('types').ServerHooks['transport']} transport
*/
function uneval_action_response(data, route_id, transport) {
	const replacer = (thing) => {
		for (const key in transport) {
			const encoded = transport[key].encode(thing);
			if (encoded) return `app.decode('${key}', ${devalue.uneval(encoded, replacer)})`;
		}
	};
	return try_serialize(data, (value) => devalue.uneval(value, replacer), route_id);
}
/**
* Try to `devalue.stringify` the data object, and if it fails, return a proper Error with context
* @param {any} data
* @param {string} route_id
* @param {import('types').ServerHooks['transport']} transport
*/
function stringify_action_response(data, route_id, transport) {
	const encoders = Object.fromEntries(Object.entries(transport).map(([key, value]) => [key, value.encode]));
	return try_serialize(data, (value) => devalue.stringify(value, encoders), route_id);
}
/**
* @param {any} data
* @param {(data: any) => string} fn
* @param {string} route_id
*/
function try_serialize(data, fn, route_id) {
	try {
		return fn(data);
	} catch (e) {
		const error = e;
		if (data instanceof Response) throw new Error(`Data returned from action inside ${route_id} is not serializable. Form actions need to return plain objects or fail(). E.g. return { success: true } or return fail(400, { message: "invalid" });`);
		if ("path" in error) {
			let message = `Data returned from action inside ${route_id} is not serializable: ${error.message}`;
			if (error.path !== "") message += ` (data.${error.path})`;
			throw new Error(message);
		}
		throw error;
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/load_data.js
/**
* Calls the user's server `load` function.
* @param {{
*   event: import('@sveltejs/kit').RequestEvent;
*   state: import('types').SSRState;
*   node: import('types').SSRNode | undefined;
*   parent: () => Promise<Record<string, any>>;
* }} opts
* @returns {Promise<import('types').ServerDataNode | null>}
*/
async function load_server_data({ event, state, node, parent }) {
	if (!node?.server) return null;
	let is_tracking = true;
	const uses = {
		dependencies: /* @__PURE__ */ new Set(),
		params: /* @__PURE__ */ new Set(),
		parent: false,
		route: false,
		url: false,
		search_params: /* @__PURE__ */ new Set()
	};
	const url = make_trackable(event.url, () => {
		if (is_tracking) uses.url = true;
	}, (param) => {
		if (is_tracking) uses.search_params.add(param);
	});
	if (state.prerendering) disable_search(url);
	return {
		type: "data",
		data: await node.server.load?.call(null, {
			...event,
			fetch: (info, init) => {
				new URL(info instanceof Request ? info.url : info, event.url);
				return event.fetch(info, init);
			},
			/** @param {string[]} deps */
			depends: (...deps) => {
				for (const dep of deps) {
					const { href } = new URL(dep, event.url);
					uses.dependencies.add(href);
				}
			},
			params: new Proxy(event.params, { get: (target, key) => {
				if (is_tracking) uses.params.add(key);
				return target[key];
			} }),
			parent: async () => {
				if (is_tracking) uses.parent = true;
				return parent();
			},
			route: new Proxy(event.route, { get: (target, key) => {
				if (is_tracking) uses.route = true;
				return target[key];
			} }),
			url,
			untrack(fn) {
				is_tracking = false;
				try {
					return fn();
				} finally {
					is_tracking = true;
				}
			}
		}) ?? null,
		uses,
		slash: node.server.trailingSlash
	};
}
/**
* Calls the user's `load` function.
* @param {{
*   event: import('@sveltejs/kit').RequestEvent;
*   fetched: import('./types.js').Fetched[];
*   node: import('types').SSRNode | undefined;
*   parent: () => Promise<Record<string, any>>;
*   resolve_opts: import('types').RequiredResolveOptions;
*   server_data_promise: Promise<import('types').ServerDataNode | null>;
*   state: import('types').SSRState;
*   csr: boolean;
* }} opts
* @returns {Promise<Record<string, any | Promise<any>> | null>}
*/
async function load_data({ event, fetched, node, parent, server_data_promise, state, resolve_opts, csr }) {
	const server_data_node = await server_data_promise;
	if (!node?.universal?.load) return server_data_node?.data ?? null;
	return await node.universal.load.call(null, {
		url: event.url,
		params: event.params,
		data: server_data_node?.data ?? null,
		route: event.route,
		fetch: create_universal_fetch(event, state, fetched, csr, resolve_opts),
		setHeaders: event.setHeaders,
		depends: () => {},
		parent,
		untrack: (fn) => fn()
	}) ?? null;
}
/**
* @param {Pick<import('@sveltejs/kit').RequestEvent, 'fetch' | 'url' | 'request' | 'route'>} event
* @param {import('types').SSRState} state
* @param {import('./types.js').Fetched[]} fetched
* @param {boolean} csr
* @param {Pick<Required<import('@sveltejs/kit').ResolveOptions>, 'filterSerializedResponseHeaders'>} resolve_opts
* @returns {typeof fetch}
*/
function create_universal_fetch(event, state, fetched, csr, resolve_opts) {
	/**
	* @param {URL | RequestInfo} input
	* @param {RequestInit} [init]
	*/
	const universal_fetch = async (input, init) => {
		const cloned_body = input instanceof Request && input.body ? input.clone().body : null;
		const cloned_headers = input instanceof Request && [...input.headers].length ? new Headers(input.headers) : init?.headers;
		let response = await event.fetch(input, init);
		const url = new URL(input instanceof Request ? input.url : input, event.url);
		const same_origin = url.origin === event.url.origin;
		/** @type {import('types').PrerenderDependency} */
		let dependency;
		if (same_origin) {
			if (state.prerendering) {
				dependency = {
					response,
					body: null
				};
				state.prerendering.dependencies.set(url.pathname, dependency);
			}
		} else if ((input instanceof Request ? input.mode : init?.mode ?? "cors") === "no-cors") response = new Response("", {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers
		});
		else {
			const acao = response.headers.get("access-control-allow-origin");
			if (!acao || acao !== event.url.origin && acao !== "*") throw new Error(`CORS error: ${acao ? "Incorrect" : "No"} 'Access-Control-Allow-Origin' header is present on the requested resource`);
		}
		const proxy = new Proxy(response, { get(response, key, _receiver) {
			/**
			* @param {string} body
			* @param {boolean} is_b64
			*/
			async function push_fetched(body, is_b64) {
				const status_number = Number(response.status);
				if (isNaN(status_number)) throw new Error(`response.status is not a number. value: "${response.status}" type: ${typeof response.status}`);
				fetched.push({
					url: same_origin ? url.href.slice(event.url.origin.length) : url.href,
					method: event.request.method,
					request_body: input instanceof Request && cloned_body ? await stream_to_string(cloned_body) : init?.body,
					request_headers: cloned_headers,
					response_body: body,
					response,
					is_b64
				});
			}
			if (key === "arrayBuffer") return async () => {
				const buffer = await response.arrayBuffer();
				if (dependency) dependency.body = new Uint8Array(buffer);
				if (buffer instanceof ArrayBuffer) await push_fetched(b64_encode(buffer), true);
				return buffer;
			};
			async function text() {
				const body = await response.text();
				if (!body || typeof body === "string") await push_fetched(body, false);
				if (dependency) dependency.body = body;
				return body;
			}
			if (key === "text") return text;
			if (key === "json") return async () => {
				return JSON.parse(await text());
			};
			return Reflect.get(response, key, response);
		} });
		if (csr) {
			const get = response.headers.get;
			response.headers.get = (key) => {
				const lower = key.toLowerCase();
				const value = get.call(response.headers, lower);
				if (value && !lower.startsWith("x-sveltekit-")) {
					if (!resolve_opts.filterSerializedResponseHeaders(lower, value)) throw new Error(`Failed to get response header "${lower}" — it must be included by the \`filterSerializedResponseHeaders\` option: https://svelte.dev/docs/kit/hooks#Server-hooks-handle (at ${event.route.id})`);
				}
				return value;
			};
		}
		return proxy;
	};
	return (input, init) => {
		const response = universal_fetch(input, init);
		response.catch(() => {});
		return response;
	};
}
/**
* @param {ReadableStream<Uint8Array>} stream
*/
async function stream_to_string(stream) {
	let result = "";
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		result += decoder.decode(value);
	}
	return result;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/serialize_data.js
/**
* Inside a script element, only `<\/script` and `<!--` hold special meaning to the HTML parser.
*
* The first closes the script element, so everything after is treated as raw HTML.
* The second disables further parsing until `-->`, so the script element might be unexpectedly
* kept open until until an unrelated HTML comment in the page.
*
* U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR are escaped for the sake of pre-2018
* browsers.
*
* @see tests for unsafe parsing examples.
* @see https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
* @see https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
* @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-state
* @see https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escaped-state
* @see https://github.com/tc39/proposal-json-superset
* @type {Record<string, string>}
*/
var replacements = {
	"<": "\\u003C",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
var pattern = new RegExp(`[${Object.keys(replacements).join("")}]`, "g");
/**
* Generates a raw HTML string containing a safe script element carrying data and associated attributes.
*
* It escapes all the special characters needed to guarantee the element is unbroken, but care must
* be taken to ensure it is inserted in the document at an acceptable position for a script element,
* and that the resulting string isn't further modified.
*
* @param {import('./types.js').Fetched} fetched
* @param {(name: string, value: string) => boolean} filter
* @param {boolean} [prerendering]
* @returns {string} The raw HTML of a script element carrying the JSON payload.
* @example const html = serialize_data('/data.json', null, { foo: 'bar' });
*/
function serialize_data(fetched, filter, prerendering = false) {
	/** @type {Record<string, string>} */
	const headers = {};
	let cache_control = null;
	let age = null;
	let varyAny = false;
	for (const [key, value] of fetched.response.headers) {
		if (filter(key, value)) headers[key] = value;
		if (key === "cache-control") cache_control = value;
		else if (key === "age") age = value;
		else if (key === "vary" && value.trim() === "*") varyAny = true;
	}
	const payload = {
		status: fetched.response.status,
		statusText: fetched.response.statusText,
		headers,
		body: fetched.response_body
	};
	const safe_payload = JSON.stringify(payload).replace(pattern, (match) => replacements[match]);
	const attrs = [
		"type=\"application/json\"",
		"data-sveltekit-fetched",
		`data-url="${escape_html(fetched.url, true)}"`
	];
	if (fetched.is_b64) attrs.push("data-b64");
	if (fetched.request_headers || fetched.request_body) {
		/** @type {import('types').StrictBody[]} */
		const values = [];
		if (fetched.request_headers) values.push([...new Headers(fetched.request_headers)].join(","));
		if (fetched.request_body) values.push(fetched.request_body);
		attrs.push(`data-hash="${hash(...values)}"`);
	}
	if (!prerendering && fetched.method === "GET" && cache_control && !varyAny) {
		const match = /s-maxage=(\d+)/g.exec(cache_control) ?? /max-age=(\d+)/g.exec(cache_control);
		if (match) {
			const ttl = +match[1] - +(age ?? "0");
			attrs.push(`data-ttl="${ttl}"`);
		}
	}
	return `<script ${attrs.join(" ")}>${safe_payload}<\/script>`;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/misc.js
var s = JSON.stringify;
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/crypto.js
var encoder$2 = new TextEncoder();
/**
* SHA-256 hashing function adapted from https://bitwiseshiftleft.github.io/sjcl
* modified and redistributed under BSD license
* @param {string} data
*/
function sha256(data) {
	if (!key[0]) precompute();
	const out = init.slice(0);
	const array = encode(data);
	for (let i = 0; i < array.length; i += 16) {
		const w = array.subarray(i, i + 16);
		let tmp;
		let a;
		let b;
		let out0 = out[0];
		let out1 = out[1];
		let out2 = out[2];
		let out3 = out[3];
		let out4 = out[4];
		let out5 = out[5];
		let out6 = out[6];
		let out7 = out[7];
		for (let i = 0; i < 64; i++) {
			if (i < 16) tmp = w[i];
			else {
				a = w[i + 1 & 15];
				b = w[i + 14 & 15];
				tmp = w[i & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i & 15] + w[i + 9 & 15] | 0;
			}
			tmp = tmp + out7 + (out4 >>> 6 ^ out4 >>> 11 ^ out4 >>> 25 ^ out4 << 26 ^ out4 << 21 ^ out4 << 7) + (out6 ^ out4 & (out5 ^ out6)) + key[i];
			out7 = out6;
			out6 = out5;
			out5 = out4;
			out4 = out3 + tmp | 0;
			out3 = out2;
			out2 = out1;
			out1 = out0;
			out0 = tmp + (out1 & out2 ^ out3 & (out1 ^ out2)) + (out1 >>> 2 ^ out1 >>> 13 ^ out1 >>> 22 ^ out1 << 30 ^ out1 << 19 ^ out1 << 10) | 0;
		}
		out[0] = out[0] + out0 | 0;
		out[1] = out[1] + out1 | 0;
		out[2] = out[2] + out2 | 0;
		out[3] = out[3] + out3 | 0;
		out[4] = out[4] + out4 | 0;
		out[5] = out[5] + out5 | 0;
		out[6] = out[6] + out6 | 0;
		out[7] = out[7] + out7 | 0;
	}
	const bytes = new Uint8Array(out.buffer);
	reverse_endianness(bytes);
	return base64(bytes);
}
/** The SHA-256 initialization vector */
var init = new Uint32Array(8);
/** The SHA-256 hash key */
var key = new Uint32Array(64);
/** Function to precompute init and key. */
function precompute() {
	/** @param {number} x */
	function frac(x) {
		return (x - Math.floor(x)) * 4294967296;
	}
	let prime = 2;
	for (let i = 0; i < 64; prime++) {
		let is_prime = true;
		for (let factor = 2; factor * factor <= prime; factor++) if (prime % factor === 0) {
			is_prime = false;
			break;
		}
		if (is_prime) {
			if (i < 8) init[i] = frac(prime ** (1 / 2));
			key[i] = frac(prime ** (1 / 3));
			i++;
		}
	}
}
/** @param {Uint8Array} bytes */
function reverse_endianness(bytes) {
	for (let i = 0; i < bytes.length; i += 4) {
		const a = bytes[i + 0];
		const b = bytes[i + 1];
		const c = bytes[i + 2];
		const d = bytes[i + 3];
		bytes[i + 0] = d;
		bytes[i + 1] = c;
		bytes[i + 2] = b;
		bytes[i + 3] = a;
	}
}
/** @param {string} str */
function encode(str) {
	const encoded = encoder$2.encode(str);
	const length = encoded.length * 8;
	const size = 512 * Math.ceil((length + 65) / 512);
	const bytes = new Uint8Array(size / 8);
	bytes.set(encoded);
	bytes[encoded.length] = 128;
	reverse_endianness(bytes);
	const words = new Uint32Array(bytes.buffer);
	words[words.length - 2] = Math.floor(length / 4294967296);
	words[words.length - 1] = length;
	return words;
}
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
/** @param {Uint8Array} bytes */
function base64(bytes) {
	const l = bytes.length;
	let result = "";
	let i;
	for (i = 2; i < l; i += 3) {
		result += chars[bytes[i - 2] >> 2];
		result += chars[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
		result += chars[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
		result += chars[bytes[i] & 63];
	}
	if (i === l + 1) {
		result += chars[bytes[i - 2] >> 2];
		result += chars[(bytes[i - 2] & 3) << 4];
		result += "==";
	}
	if (i === l) {
		result += chars[bytes[i - 2] >> 2];
		result += chars[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
		result += chars[(bytes[i - 1] & 15) << 2];
		result += "=";
	}
	return result;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/csp.js
var array = new Uint8Array(16);
function generate_nonce() {
	crypto.getRandomValues(array);
	return base64(array);
}
var quoted = new Set([
	"self",
	"unsafe-eval",
	"unsafe-hashes",
	"unsafe-inline",
	"none",
	"strict-dynamic",
	"report-sample",
	"wasm-unsafe-eval",
	"script"
]);
var crypto_pattern = /^(nonce|sha\d\d\d)-/;
var BaseProvider = class {
	/** @type {boolean} */
	#use_hashes;
	/** @type {boolean} */
	#script_needs_csp;
	/** @type {boolean} */
	#script_src_needs_csp;
	/** @type {boolean} */
	#script_src_elem_needs_csp;
	/** @type {boolean} */
	#style_needs_csp;
	/** @type {boolean} */
	#style_src_needs_csp;
	/** @type {boolean} */
	#style_src_attr_needs_csp;
	/** @type {boolean} */
	#style_src_elem_needs_csp;
	/** @type {import('types').CspDirectives} */
	#directives;
	/** @type {import('types').Csp.Source[]} */
	#script_src;
	/** @type {import('types').Csp.Source[]} */
	#script_src_elem;
	/** @type {import('types').Csp.Source[]} */
	#style_src;
	/** @type {import('types').Csp.Source[]} */
	#style_src_attr;
	/** @type {import('types').Csp.Source[]} */
	#style_src_elem;
	/** @type {string} */
	#nonce;
	/**
	* @param {boolean} use_hashes
	* @param {import('types').CspDirectives} directives
	* @param {string} nonce
	*/
	constructor(use_hashes, directives, nonce) {
		this.#use_hashes = use_hashes;
		this.#directives = directives;
		const d = this.#directives;
		this.#script_src = [];
		this.#script_src_elem = [];
		this.#style_src = [];
		this.#style_src_attr = [];
		this.#style_src_elem = [];
		const effective_script_src = d["script-src"] || d["default-src"];
		const script_src_elem = d["script-src-elem"];
		const effective_style_src = d["style-src"] || d["default-src"];
		const style_src_attr = d["style-src-attr"];
		const style_src_elem = d["style-src-elem"];
		/** @param {(import('types').Csp.Source | import('types').Csp.ActionSource)[] | undefined} directive */
		const needs_csp = (directive) => !!directive && !directive.some((value) => value === "unsafe-inline");
		this.#script_src_needs_csp = needs_csp(effective_script_src);
		this.#script_src_elem_needs_csp = needs_csp(script_src_elem);
		this.#style_src_needs_csp = needs_csp(effective_style_src);
		this.#style_src_attr_needs_csp = needs_csp(style_src_attr);
		this.#style_src_elem_needs_csp = needs_csp(style_src_elem);
		this.#script_needs_csp = this.#script_src_needs_csp || this.#script_src_elem_needs_csp;
		this.#style_needs_csp = this.#style_src_needs_csp || this.#style_src_attr_needs_csp || this.#style_src_elem_needs_csp;
		this.script_needs_nonce = this.#script_needs_csp && !this.#use_hashes;
		this.style_needs_nonce = this.#style_needs_csp && !this.#use_hashes;
		this.#nonce = nonce;
	}
	/** @param {string} content */
	add_script(content) {
		if (!this.#script_needs_csp) return;
		/** @type {`nonce-${string}` | `sha256-${string}`} */
		const source = this.#use_hashes ? `sha256-${sha256(content)}` : `nonce-${this.#nonce}`;
		if (this.#script_src_needs_csp) this.#script_src.push(source);
		if (this.#script_src_elem_needs_csp) this.#script_src_elem.push(source);
	}
	/** @param {string} content */
	add_style(content) {
		if (!this.#style_needs_csp) return;
		/** @type {`nonce-${string}` | `sha256-${string}`} */
		const source = this.#use_hashes ? `sha256-${sha256(content)}` : `nonce-${this.#nonce}`;
		if (this.#style_src_needs_csp) this.#style_src.push(source);
		if (this.#style_src_attr_needs_csp) this.#style_src_attr.push(source);
		if (this.#style_src_elem_needs_csp) {
			const sha256_empty_comment_hash = "sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=";
			const d = this.#directives;
			if (d["style-src-elem"] && !d["style-src-elem"].includes(sha256_empty_comment_hash) && !this.#style_src_elem.includes(sha256_empty_comment_hash)) this.#style_src_elem.push(sha256_empty_comment_hash);
			if (source !== sha256_empty_comment_hash) this.#style_src_elem.push(source);
		}
	}
	/**
	* @param {boolean} [is_meta]
	*/
	get_header(is_meta = false) {
		const header = [];
		const directives = { ...this.#directives };
		if (this.#style_src.length > 0) directives["style-src"] = [...directives["style-src"] || directives["default-src"] || [], ...this.#style_src];
		if (this.#style_src_attr.length > 0) directives["style-src-attr"] = [...directives["style-src-attr"] || [], ...this.#style_src_attr];
		if (this.#style_src_elem.length > 0) directives["style-src-elem"] = [...directives["style-src-elem"] || [], ...this.#style_src_elem];
		if (this.#script_src.length > 0) directives["script-src"] = [...directives["script-src"] || directives["default-src"] || [], ...this.#script_src];
		if (this.#script_src_elem.length > 0) directives["script-src-elem"] = [...directives["script-src-elem"] || [], ...this.#script_src_elem];
		for (const key in directives) {
			if (is_meta && (key === "frame-ancestors" || key === "report-uri" || key === "sandbox")) continue;
			const value = directives[key];
			if (!value) continue;
			const directive = [key];
			if (Array.isArray(value)) value.forEach((value) => {
				if (quoted.has(value) || crypto_pattern.test(value)) directive.push(`'${value}'`);
				else directive.push(value);
			});
			header.push(directive.join(" "));
		}
		return header.join("; ");
	}
};
var CspProvider = class extends BaseProvider {
	get_meta() {
		const content = this.get_header(true);
		if (!content) return;
		return `<meta http-equiv="content-security-policy" content="${escape_html(content, true)}">`;
	}
};
var CspReportOnlyProvider = class extends BaseProvider {
	/**
	* @param {boolean} use_hashes
	* @param {import('types').CspDirectives} directives
	* @param {string} nonce
	*/
	constructor(use_hashes, directives, nonce) {
		super(use_hashes, directives, nonce);
		if (Object.values(directives).filter((v) => !!v).length > 0) {
			const has_report_to = directives["report-to"]?.length ?? false;
			const has_report_uri = directives["report-uri"]?.length ?? false;
			if (!has_report_to && !has_report_uri) throw Error("`content-security-policy-report-only` must be specified with either the `report-to` or `report-uri` directives, or both");
		}
	}
};
var Csp = class {
	/** @readonly */
	nonce = generate_nonce();
	/** @type {CspProvider} */
	csp_provider;
	/** @type {CspReportOnlyProvider} */
	report_only_provider;
	/**
	* @param {import('./types.js').CspConfig} config
	* @param {import('./types.js').CspOpts} opts
	*/
	constructor({ mode, directives, reportOnly }, { prerender }) {
		const use_hashes = mode === "hash" || mode === "auto" && prerender;
		this.csp_provider = new CspProvider(use_hashes, directives, this.nonce);
		this.report_only_provider = new CspReportOnlyProvider(use_hashes, reportOnly, this.nonce);
	}
	get script_needs_nonce() {
		return this.csp_provider.script_needs_nonce || this.report_only_provider.script_needs_nonce;
	}
	get style_needs_nonce() {
		return this.csp_provider.style_needs_nonce || this.report_only_provider.style_needs_nonce;
	}
	/** @param {string} content */
	add_script(content) {
		this.csp_provider.add_script(content);
		this.report_only_provider.add_script(content);
	}
	/** @param {string} content */
	add_style(content) {
		this.csp_provider.add_style(content);
		this.report_only_provider.add_style(content);
	}
};
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/streaming.js
/**
* @returns {import('types').Deferred & { promise: Promise<any> }}}
*/
function defer() {
	let fulfil;
	let reject;
	return {
		promise: new Promise((f, r) => {
			fulfil = f;
			reject = r;
		}),
		fulfil,
		reject
	};
}
/**
* Create an async iterator and a function to push values into it
* @returns {{
*   iterator: AsyncIterable<any>;
*   push: (value: any) => void;
*   done: () => void;
* }}
*/
function create_async_iterator() {
	const deferred = [defer()];
	return {
		iterator: { [Symbol.asyncIterator]() {
			return { next: async () => {
				const next = await deferred[0].promise;
				if (!next.done) deferred.shift();
				return next;
			} };
		} },
		push: (value) => {
			deferred[deferred.length - 1].fulfil({
				value,
				done: false
			});
			deferred.push(defer());
		},
		done: () => {
			deferred[deferred.length - 1].fulfil({ done: true });
		}
	};
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/render.js
var updated = {
	...readable(false),
	check: () => false
};
var encoder$1 = new TextEncoder();
/**
* Creates the HTML response.
* @param {{
*   branch: Array<import('./types.js').Loaded>;
*   fetched: Array<import('./types.js').Fetched>;
*   options: import('types').SSROptions;
*   manifest: import('@sveltejs/kit').SSRManifest;
*   state: import('types').SSRState;
*   page_config: { ssr: boolean; csr: boolean };
*   status: number;
*   error: App.Error | null;
*   event: import('@sveltejs/kit').RequestEvent;
*   resolve_opts: import('types').RequiredResolveOptions;
*   action_result?: import('@sveltejs/kit').ActionResult;
* }} opts
*/
async function render_response({ branch, fetched, options, manifest, state, page_config, status, error = null, event, resolve_opts, action_result }) {
	if (state.prerendering) {
		if (options.csp.mode === "nonce") throw new Error("Cannot use prerendering if config.kit.csp.mode === \"nonce\"");
		if (options.app_template_contains_nonce) throw new Error("Cannot use prerendering if page template contains %sveltekit.nonce%");
	}
	const { client } = manifest._;
	const modulepreloads = new Set(client.imports);
	const stylesheets = new Set(client.stylesheets);
	const fonts = new Set(client.fonts);
	/** @type {Set<string>} */
	const link_header_preloads = /* @__PURE__ */ new Set();
	/** @type {Map<string, string>} */
	const inline_styles = /* @__PURE__ */ new Map();
	let rendered;
	const form_value = action_result?.type === "success" || action_result?.type === "failure" ? action_result.data ?? null : null;
	/** @type {string} */
	let base$1 = base;
	/** @type {string} */
	let assets$1 = assets;
	/**
	* An expression that will evaluate in the client to determine the resolved base path.
	* We use a relative path when possible to support IPFS, the internet archive, etc.
	*/
	let base_expression = s(base);
	if (!state.prerendering?.fallback) {
		base$1 = event.url.pathname.slice(base.length).split("/").slice(2).map(() => "..").join("/") || ".";
		base_expression = `new URL(${s(base$1)}, location).pathname.slice(0, -1)`;
		if (!assets || assets[0] === "/" && assets !== "/_svelte_kit_assets") assets$1 = base$1;
	} else if (options.hash_routing) base_expression = "new URL('.', location).pathname.slice(0, -1)";
	if (page_config.ssr) {
		/** @type {Record<string, any>} */
		const props = {
			stores: {
				page: writable(null),
				navigating: writable(null),
				updated
			},
			constructors: await Promise.all(branch.map(({ node }) => node.component())),
			form: form_value
		};
		let data = {};
		for (let i = 0; i < branch.length; i += 1) {
			data = {
				...data,
				...branch[i].data
			};
			props[`data_${i}`] = data;
		}
		props.page = {
			error,
			params: event.params,
			route: event.route,
			status,
			url: event.url,
			data,
			form: form_value,
			state: {}
		};
		override({
			base: base$1,
			assets: assets$1
		});
		const render_opts = { context: new Map([["__request__", { page: props.page }]]) };
		try {
			rendered = options.root.render(props, render_opts);
		} finally {
			reset();
		}
		for (const { node } of branch) {
			for (const url of node.imports) modulepreloads.add(url);
			for (const url of node.stylesheets) stylesheets.add(url);
			for (const url of node.fonts) fonts.add(url);
			if (node.inline_styles && !client.inline) Object.entries(await node.inline_styles()).forEach(([k, v]) => inline_styles.set(k, v));
		}
	} else rendered = {
		head: "",
		html: "",
		css: {
			code: "",
			map: null
		}
	};
	let head = "";
	let body = rendered.html;
	const csp = new Csp(options.csp, { prerender: !!state.prerendering });
	/** @param {string} path */
	const prefixed = (path) => {
		if (path.startsWith("/")) return base + path;
		return `${assets$1}/${path}`;
	};
	const style = client.inline ? client.inline?.style : Array.from(inline_styles.values()).join("\n");
	if (style) {
		const attributes = [];
		if (csp.style_needs_nonce) attributes.push(` nonce="${csp.nonce}"`);
		csp.add_style(style);
		head += `\n\t<style${attributes.join("")}>${style}</style>`;
	}
	for (const dep of stylesheets) {
		const path = prefixed(dep);
		const attributes = ["rel=\"stylesheet\""];
		if (inline_styles.has(dep)) attributes.push("disabled", "media=\"(max-width: 0)\"");
		else if (resolve_opts.preload({
			type: "css",
			path
		})) link_header_preloads.add(`<${encodeURI(path)}>; ${["rel=\"preload\"", "as=\"style\""].join(";")}; nopush`);
		head += `\n\t\t<link href="${path}" ${attributes.join(" ")}>`;
	}
	for (const dep of fonts) {
		const path = prefixed(dep);
		if (resolve_opts.preload({
			type: "font",
			path
		})) {
			const attributes = [
				"rel=\"preload\"",
				"as=\"font\"",
				`type="font/${dep.slice(dep.lastIndexOf(".") + 1)}"`,
				`href="${path}"`,
				"crossorigin"
			];
			head += `\n\t\t<link ${attributes.join(" ")}>`;
		}
	}
	const global = `__sveltekit_${options.version_hash}`;
	const { data, chunks } = get_data(event, options, branch.map((b) => b.server_data), csp, global);
	if (page_config.ssr && page_config.csr) body += `\n\t\t\t${fetched.map((item) => serialize_data(item, resolve_opts.filterSerializedResponseHeaders, !!state.prerendering)).join("\n			")}`;
	if (page_config.csr) {
		if (client.uses_env_dynamic_public && state.prerendering) modulepreloads.add(`${options.app_dir}/env.js`);
		if (!client.inline) {
			const included_modulepreloads = Array.from(modulepreloads, (dep) => prefixed(dep)).filter((path) => resolve_opts.preload({
				type: "js",
				path
			}));
			for (const path of included_modulepreloads) {
				link_header_preloads.add(`<${encodeURI(path)}>; rel="modulepreload"; nopush`);
				if (options.preload_strategy !== "modulepreload") head += `\n\t\t<link rel="preload" as="script" crossorigin="anonymous" href="${path}">`;
				else if (state.prerendering) head += `\n\t\t<link rel="modulepreload" href="${path}">`;
			}
		}
		const blocks = [];
		const load_env_eagerly = client.uses_env_dynamic_public && state.prerendering;
		const properties = [`base: ${base_expression}`];
		if (assets) properties.push(`assets: ${s(assets)}`);
		if (client.uses_env_dynamic_public) properties.push(`env: ${load_env_eagerly ? "null" : s(public_env)}`);
		if (chunks) {
			blocks.push("const deferred = new Map();");
			properties.push(`defer: (id) => new Promise((fulfil, reject) => {
							deferred.set(id, { fulfil, reject });
						})`);
			properties.push(`resolve: ({ id, data, error }) => {
							const try_to_resolve = () => {
								if (!deferred.has(id)) {
									setTimeout(try_to_resolve, 0);
									return;
								}
								const { fulfil, reject } = deferred.get(id);
								deferred.delete(id);
								if (error) reject(error);
								else fulfil(data);
							}
							try_to_resolve();
						}`);
		}
		blocks.push(`${global} = {
						${properties.join(",\n						")}
					};`);
		const args = ["element"];
		blocks.push("const element = document.currentScript.parentElement;");
		if (page_config.ssr) {
			const serialized = {
				form: "null",
				error: "null"
			};
			if (form_value) serialized.form = uneval_action_response(form_value, event.route.id, options.hooks.transport);
			if (error) serialized.error = devalue.uneval(error);
			const hydrate = [
				`node_ids: [${branch.map(({ node }) => node.index).join(", ")}]`,
				`data: ${data}`,
				`form: ${serialized.form}`,
				`error: ${serialized.error}`
			];
			if (status !== 200) hydrate.push(`status: ${status}`);
			if (options.embedded) hydrate.push(`params: ${devalue.uneval(event.params)}`, `route: ${s(event.route)}`);
			const indent = "	".repeat(load_env_eagerly ? 7 : 6);
			args.push(`{\n${indent}\t${hydrate.join(`,\n${indent}\t`)}\n${indent}}`);
		}
		const boot = client.inline ? `${client.inline.script}

					__sveltekit_${options.version_hash}.app.start(${args.join(", ")});` : client.app ? `Promise.all([
						import(${s(prefixed(client.start))}),
						import(${s(prefixed(client.app))})
					]).then(([kit, app]) => {
						kit.start(app, ${args.join(", ")});
					});` : `import(${s(prefixed(client.start))}).then((app) => {
						app.start(${args.join(", ")})
					});`;
		if (load_env_eagerly) blocks.push(`import(${s(`${base$1}/${options.app_dir}/env.js`)}).then(({ env }) => {
						${global}.env = env;

						${boot.replace(/\n/g, "\n	")}
					});`);
		else blocks.push(boot);
		if (options.service_worker) blocks.push(`if ('serviceWorker' in navigator) {
						addEventListener('load', function () {
							navigator.serviceWorker.register('${prefixed("service-worker.js")}');
						});
					}`);
		const init_app = `
				{
					${blocks.join("\n\n					")}
				}
			`;
		csp.add_script(init_app);
		body += `\n\t\t\t<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>${init_app}<\/script>\n\t\t`;
	}
	const headers = new Headers({
		"x-sveltekit-page": "true",
		"content-type": "text/html"
	});
	if (state.prerendering) {
		const http_equiv = [];
		const csp_headers = csp.csp_provider.get_meta();
		if (csp_headers) http_equiv.push(csp_headers);
		if (state.prerendering.cache) http_equiv.push(`<meta http-equiv="cache-control" content="${state.prerendering.cache}">`);
		if (http_equiv.length > 0) head = http_equiv.join("\n") + head;
	} else {
		const csp_header = csp.csp_provider.get_header();
		if (csp_header) headers.set("content-security-policy", csp_header);
		const report_only_header = csp.report_only_provider.get_header();
		if (report_only_header) headers.set("content-security-policy-report-only", report_only_header);
		if (link_header_preloads.size) headers.set("link", Array.from(link_header_preloads).join(", "));
	}
	head += rendered.head;
	const html = options.templates.app({
		head,
		body,
		assets: assets$1,
		nonce: csp.nonce,
		env: safe_public_env
	});
	const transformed = await resolve_opts.transformPageChunk({
		html,
		done: true
	}) || "";
	if (!chunks) headers.set("etag", `"${hash(transformed)}"`);
	return !chunks ? text(transformed, {
		status,
		headers
	}) : new Response(new ReadableStream({
		async start(controller) {
			controller.enqueue(encoder$1.encode(transformed + "\n"));
			for await (const chunk of chunks) controller.enqueue(encoder$1.encode(chunk));
			controller.close();
		},
		type: "bytes"
	}), { headers });
}
/**
* If the serialized data contains promises, `chunks` will be an
* async iterable containing their resolutions
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSROptions} options
* @param {Array<import('types').ServerDataNode | null>} nodes
* @param {import('./csp.js').Csp} csp
* @param {string} global
* @returns {{ data: string, chunks: AsyncIterable<string> | null }}
*/
function get_data(event, options, nodes, csp, global) {
	let promise_id = 1;
	let count = 0;
	const { iterator, push, done } = create_async_iterator();
	/** @param {any} thing */
	function replacer(thing) {
		if (typeof thing?.then === "function") {
			const id = promise_id++;
			count += 1;
			thing.then(
				/** @param {any} data */
				(data) => ({ data })
			).catch(
				/** @param {any} error */
				async (error) => ({ error: await handle_error_and_jsonify(event, options, error) })
			).then(
				/**
				* @param {{data: any; error: any}} result
				*/
				async ({ data, error }) => {
					count -= 1;
					let str;
					try {
						str = devalue.uneval({
							id,
							data,
							error
						}, replacer);
					} catch {
						error = await handle_error_and_jsonify(event, options, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
						data = void 0;
						str = devalue.uneval({
							id,
							data,
							error
						}, replacer);
					}
					push(`<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>${global}.resolve(${str})<\/script>\n`);
					if (count === 0) done();
				}
			);
			return `${global}.defer(${id})`;
		} else for (const key in options.hooks.transport) {
			const encoded = options.hooks.transport[key].encode(thing);
			if (encoded) return `app.decode('${key}', ${devalue.uneval(encoded, replacer)})`;
		}
	}
	try {
		return {
			data: `[${nodes.map((node) => {
				if (!node) return "null";
				return `{"type":"data","data":${devalue.uneval(node.data, replacer)},${stringify_uses(node)}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
			}).join(",")}]`,
			chunks: count > 0 ? iterator : null
		};
	} catch (e) {
		throw new Error(clarify_devalue_error(event, e));
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/options.js
/**
* @template {'prerender' | 'ssr' | 'csr' | 'trailingSlash' | 'entries'} Option
* @template {(import('types').SSRNode['universal'] | import('types').SSRNode['server'])[Option]} Value
*
* @param {Array<import('types').SSRNode | undefined>} nodes
* @param {Option} option
*
* @returns {Value | undefined}
*/
function get_option(nodes, option) {
	return nodes.reduce((value, node) => {
		return node?.universal?.[option] ?? node?.server?.[option] ?? value;
	}, void 0);
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/respond_with_error.js
/**
* @typedef {import('./types.js').Loaded} Loaded
*/
/**
* @param {{
*   event: import('@sveltejs/kit').RequestEvent;
*   options: import('types').SSROptions;
*   manifest: import('@sveltejs/kit').SSRManifest;
*   state: import('types').SSRState;
*   status: number;
*   error: unknown;
*   resolve_opts: import('types').RequiredResolveOptions;
* }} opts
*/
async function respond_with_error({ event, options, manifest, state, status, error, resolve_opts }) {
	if (event.request.headers.get("x-sveltekit-error")) return static_error_page(
		options,
		status,
		/** @type {Error} */
		error.message
	);
	/** @type {import('./types.js').Fetched[]} */
	const fetched = [];
	try {
		const branch = [];
		const default_layout = await manifest._.nodes[0]();
		const ssr = get_option([default_layout], "ssr") ?? true;
		const csr = get_option([default_layout], "csr") ?? true;
		if (ssr) {
			state.error = true;
			const server_data_promise = load_server_data({
				event,
				state,
				node: default_layout,
				parent: async () => ({})
			});
			const server_data = await server_data_promise;
			const data = await load_data({
				event,
				fetched,
				node: default_layout,
				parent: async () => ({}),
				resolve_opts,
				server_data_promise,
				state,
				csr
			});
			branch.push({
				node: default_layout,
				server_data,
				data
			}, {
				node: await manifest._.nodes[1](),
				data: null,
				server_data: null
			});
		}
		return await render_response({
			options,
			manifest,
			state,
			page_config: {
				ssr,
				csr
			},
			status,
			error: await handle_error_and_jsonify(event, options, error),
			branch,
			fetched,
			event,
			resolve_opts
		});
	} catch (e) {
		if (e instanceof Redirect) return redirect_response(e.status, e.location);
		return static_error_page(options, get_status(e), (await handle_error_and_jsonify(event, options, e)).message);
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/functions.js
/**
* @template T
* @param {() => T} fn
*/
function once(fn) {
	let done = false;
	/** @type T */
	let result;
	return () => {
		if (done) return result;
		done = true;
		return result = fn();
	};
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/data/index.js
var encoder = new TextEncoder();
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSRRoute} route
* @param {import('types').SSROptions} options
* @param {import('@sveltejs/kit').SSRManifest} manifest
* @param {import('types').SSRState} state
* @param {boolean[] | undefined} invalidated_data_nodes
* @param {import('types').TrailingSlash} trailing_slash
* @returns {Promise<Response>}
*/
async function render_data(event, route, options, manifest, state, invalidated_data_nodes, trailing_slash) {
	if (!route.page) return new Response(void 0, { status: 404 });
	try {
		const node_ids = [...route.page.layouts, route.page.leaf];
		const invalidated = invalidated_data_nodes ?? node_ids.map(() => true);
		let aborted = false;
		const url = new URL(event.url);
		url.pathname = normalize_path(url.pathname, trailing_slash);
		const new_event = {
			...event,
			url
		};
		const functions = node_ids.map((n, i) => {
			return once(async () => {
				try {
					if (aborted) return { type: "skip" };
					return load_server_data({
						event: new_event,
						state,
						node: n == void 0 ? n : await manifest._.nodes[n](),
						parent: async () => {
							/** @type {Record<string, any>} */
							const data = {};
							for (let j = 0; j < i; j += 1) {
								const parent = await functions[j]();
								if (parent) Object.assign(data, parent.data);
							}
							return data;
						}
					});
				} catch (e) {
					aborted = true;
					throw e;
				}
			});
		});
		const promises = functions.map(async (fn, i) => {
			if (!invalidated[i]) return { type: "skip" };
			return fn();
		});
		let length = promises.length;
		const { data, chunks } = get_data_json(event, options, await Promise.all(promises.map((p, i) => p.catch(async (error) => {
			if (error instanceof Redirect) throw error;
			length = Math.min(length, i + 1);
			return {
				type: "error",
				error: await handle_error_and_jsonify(event, options, error),
				status: error instanceof HttpError || error instanceof SvelteKitError ? error.status : void 0
			};
		}))));
		if (!chunks) return json_response(data);
		return new Response(new ReadableStream({
			async start(controller) {
				controller.enqueue(encoder.encode(data));
				for await (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
				controller.close();
			},
			type: "bytes"
		}), { headers: {
			"content-type": "text/sveltekit-data",
			"cache-control": "private, no-store"
		} });
	} catch (e) {
		const error = normalize_error(e);
		if (error instanceof Redirect) return redirect_json_response(error);
		else return json_response(await handle_error_and_jsonify(event, options, error), 500);
	}
}
/**
* @param {Record<string, any> | string} json
* @param {number} [status]
*/
function json_response(json, status = 200) {
	return text(typeof json === "string" ? json : JSON.stringify(json), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "private, no-store"
		}
	});
}
/**
* @param {Redirect} redirect
*/
function redirect_json_response(redirect) {
	return json_response({
		type: "redirect",
		location: redirect.location
	});
}
/**
* If the serialized data contains promises, `chunks` will be an
* async iterable containing their resolutions
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').SSROptions} options
* @param {Array<import('types').ServerDataSkippedNode | import('types').ServerDataNode | import('types').ServerErrorNode | null | undefined>} nodes
*  @returns {{ data: string, chunks: AsyncIterable<string> | null }}
*/
function get_data_json(event, options, nodes) {
	let promise_id = 1;
	let count = 0;
	const { iterator, push, done } = create_async_iterator();
	const reducers = {
		...Object.fromEntries(Object.entries(options.hooks.transport).map(([key, value]) => [key, value.encode])),
		/** @param {any} thing */
		Promise: (thing) => {
			if (typeof thing?.then === "function") {
				const id = promise_id++;
				count += 1;
				/** @type {'data' | 'error'} */
				let key = "data";
				thing.catch(
					/** @param {any} e */
					async (e) => {
						key = "error";
						return handle_error_and_jsonify(event, options, e);
					}
				).then(
					/** @param {any} value */
					async (value) => {
						let str;
						try {
							str = devalue.stringify(value, reducers);
						} catch {
							const error = await handle_error_and_jsonify(event, options, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
							key = "error";
							str = devalue.stringify(error, reducers);
						}
						count -= 1;
						push(`{"type":"chunk","id":${id},"${key}":${str}}\n`);
						if (count === 0) done();
					}
				);
				return id;
			}
		}
	};
	try {
		return {
			data: `{"type":"data","nodes":[${nodes.map((node) => {
				if (!node) return "null";
				if (node.type === "error" || node.type === "skip") return JSON.stringify(node);
				return `{"type":"data","data":${devalue.stringify(node.data, reducers)},${stringify_uses(node)}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
			}).join(",")}]}\n`,
			chunks: count > 0 ? iterator : null
		};
	} catch (e) {
		throw new Error(clarify_devalue_error(event, e));
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/load_page_nodes.js
/**
* @param {import('types').PageNodeIndexes} page
* @param {import('@sveltejs/kit').SSRManifest} manifest
*/
function load_page_nodes(page, manifest) {
	return Promise.all([...page.layouts.map((n) => n == void 0 ? n : manifest._.nodes[n]()), manifest._.nodes[page.leaf]()]);
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/page/index.js
/**
* The maximum request depth permitted before assuming we're stuck in an infinite loop
*/
var MAX_DEPTH = 10;
/**
* @param {import('@sveltejs/kit').RequestEvent} event
* @param {import('types').PageNodeIndexes} page
* @param {import('types').SSROptions} options
* @param {import('@sveltejs/kit').SSRManifest} manifest
* @param {import('types').SSRState} state
* @param {import('types').RequiredResolveOptions} resolve_opts
* @returns {Promise<Response>}
*/
async function render_page(event, page, options, manifest, state, resolve_opts) {
	if (state.depth > MAX_DEPTH) return text(`Not found: ${event.url.pathname}`, { status: 404 });
	if (is_action_json_request(event)) return handle_action_json_request(event, options, (await manifest._.nodes[page.leaf]())?.server);
	try {
		const nodes = await load_page_nodes(page, manifest);
		const leaf_node = nodes.at(-1);
		let status = 200;
		/** @type {import('@sveltejs/kit').ActionResult | undefined} */
		let action_result = void 0;
		if (is_action_request(event)) {
			action_result = await handle_action_request(event, leaf_node.server);
			if (action_result?.type === "redirect") return redirect_response(action_result.status, action_result.location);
			if (action_result?.type === "error") status = get_status(action_result.error);
			if (action_result?.type === "failure") status = action_result.status;
		}
		const should_prerender_data = nodes.some((node) => node?.server?.load || node?.server?.trailingSlash !== void 0);
		const data_pathname = add_data_suffix(event.url.pathname);
		const should_prerender = get_option(nodes, "prerender") ?? false;
		if (should_prerender) {
			if (leaf_node.server?.actions) throw new Error("Cannot prerender pages with actions");
		} else if (state.prerendering) return new Response(void 0, { status: 204 });
		state.prerender_default = should_prerender;
		/** @type {import('./types.js').Fetched[]} */
		const fetched = [];
		if (get_option(nodes, "ssr") === false && !(state.prerendering && should_prerender_data)) return await render_response({
			branch: [],
			fetched,
			page_config: {
				ssr: false,
				csr: get_option(nodes, "csr") ?? true
			},
			status,
			error: null,
			event,
			options,
			manifest,
			state,
			resolve_opts
		});
		/** @type {Array<import('./types.js').Loaded | null>} */
		const branch = [];
		/** @type {Error | null} */
		let load_error = null;
		/** @type {Array<Promise<import('types').ServerDataNode | null>>} */
		const server_promises = nodes.map((node, i) => {
			if (load_error) throw load_error;
			return Promise.resolve().then(async () => {
				try {
					if (node === leaf_node && action_result?.type === "error") throw action_result.error;
					return await load_server_data({
						event,
						state,
						node,
						parent: async () => {
							/** @type {Record<string, any>} */
							const data = {};
							for (let j = 0; j < i; j += 1) {
								const parent = await server_promises[j];
								if (parent) Object.assign(data, parent.data);
							}
							return data;
						}
					});
				} catch (e) {
					load_error = e;
					throw load_error;
				}
			});
		});
		const csr = get_option(nodes, "csr") ?? true;
		/** @type {Array<Promise<Record<string, any> | null>>} */
		const load_promises = nodes.map((node, i) => {
			if (load_error) throw load_error;
			return Promise.resolve().then(async () => {
				try {
					return await load_data({
						event,
						fetched,
						node,
						parent: async () => {
							const data = {};
							for (let j = 0; j < i; j += 1) Object.assign(data, await load_promises[j]);
							return data;
						},
						resolve_opts,
						server_data_promise: server_promises[i],
						state,
						csr
					});
				} catch (e) {
					load_error = e;
					throw load_error;
				}
			});
		});
		for (const p of server_promises) p.catch(() => {});
		for (const p of load_promises) p.catch(() => {});
		for (let i = 0; i < nodes.length; i += 1) {
			const node = nodes[i];
			if (node) try {
				const server_data = await server_promises[i];
				const data = await load_promises[i];
				branch.push({
					node,
					server_data,
					data
				});
			} catch (e) {
				const err = normalize_error(e);
				if (err instanceof Redirect) {
					if (state.prerendering && should_prerender_data) {
						const body = JSON.stringify({
							type: "redirect",
							location: err.location
						});
						state.prerendering.dependencies.set(data_pathname, {
							response: text(body),
							body
						});
					}
					return redirect_response(err.status, err.location);
				}
				const status = get_status(err);
				const error = await handle_error_and_jsonify(event, options, err);
				while (i--) if (page.errors[i]) {
					const index = page.errors[i];
					const node = await manifest._.nodes[index]();
					let j = i;
					while (!branch[j]) j -= 1;
					return await render_response({
						event,
						options,
						manifest,
						state,
						resolve_opts,
						page_config: {
							ssr: true,
							csr: true
						},
						status,
						error,
						branch: compact(branch.slice(0, j + 1)).concat({
							node,
							data: null,
							server_data: null
						}),
						fetched
					});
				}
				return static_error_page(options, status, error.message);
			}
			else branch.push(null);
		}
		if (state.prerendering && should_prerender_data) {
			let { data, chunks } = get_data_json(event, options, branch.map((node) => node?.server_data));
			if (chunks) for await (const chunk of chunks) data += chunk;
			state.prerendering.dependencies.set(data_pathname, {
				response: text(data),
				body: data
			});
		}
		const ssr = get_option(nodes, "ssr") ?? true;
		return await render_response({
			event,
			options,
			manifest,
			state,
			resolve_opts,
			page_config: {
				csr: get_option(nodes, "csr") ?? true,
				ssr
			},
			status,
			error: null,
			branch: ssr === false ? [] : compact(branch),
			action_result,
			fetched
		});
	} catch (e) {
		return await respond_with_error({
			event,
			options,
			manifest,
			state,
			status: 500,
			error: e,
			resolve_opts
		});
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/routing.js
/**
* @param {RegExpMatchArray} match
* @param {import('types').RouteParam[]} params
* @param {Record<string, import('@sveltejs/kit').ParamMatcher>} matchers
*/
function exec(match, params, matchers) {
	/** @type {Record<string, string>} */
	const result = {};
	const values = match.slice(1);
	const values_needing_match = values.filter((value) => value !== void 0);
	let buffered = 0;
	for (let i = 0; i < params.length; i += 1) {
		const param = params[i];
		let value = values[i - buffered];
		if (param.chained && param.rest && buffered) {
			value = values.slice(i - buffered, i + 1).filter((s) => s).join("/");
			buffered = 0;
		}
		if (value === void 0) {
			if (param.rest) result[param.name] = "";
			continue;
		}
		if (!param.matcher || matchers[param.matcher](value)) {
			result[param.name] = value;
			const next_param = params[i + 1];
			const next_value = values[i + 1];
			if (next_param && !next_param.rest && next_param.optional && next_value && param.chained) buffered = 0;
			if (!next_param && !next_value && Object.keys(result).length === values_needing_match.length) buffered = 0;
			continue;
		}
		if (param.optional && param.chained) {
			buffered++;
			continue;
		}
		return;
	}
	if (buffered) return;
	return result;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/cookie.js
var INVALID_COOKIE_CHARACTER_REGEX = /[\x00-\x1F\x7F()<>@,;:"/[\]?={} \t]/;
/** @param {import('./page/types.js').Cookie['options']} options */
function validate_options(options) {
	if (options?.path === void 0) throw new Error("You must specify a `path` when setting, deleting or serializing cookies");
}
/**
* @param {Request} request
* @param {URL} url
* @param {import('types').TrailingSlash} trailing_slash
*/
function get_cookies(request, url, trailing_slash) {
	const header = request.headers.get("cookie") ?? "";
	const initial_cookies = parse(header, { decode: (value) => value });
	const normalized_url = normalize_path(url.pathname, trailing_slash);
	/** @type {Record<string, import('./page/types.js').Cookie>} */
	const new_cookies = {};
	/** @type {import('cookie').CookieSerializeOptions} */
	const defaults = {
		httpOnly: true,
		sameSite: "lax",
		secure: url.hostname === "localhost" && url.protocol === "http:" ? false : true
	};
	/** @type {import('@sveltejs/kit').Cookies} */
	const cookies = {
		/**
		* @param {string} name
		* @param {import('cookie').CookieParseOptions} [opts]
		*/
		get(name, opts) {
			const c = new_cookies[name];
			if (c && domain_matches(url.hostname, c.options.domain) && path_matches(url.pathname, c.options.path)) return c.value;
			return parse(header, { decode: opts?.decode })[name];
		},
		/**
		* @param {import('cookie').CookieParseOptions} [opts]
		*/
		getAll(opts) {
			const cookies = parse(header, { decode: opts?.decode });
			for (const c of Object.values(new_cookies)) if (domain_matches(url.hostname, c.options.domain) && path_matches(url.pathname, c.options.path)) cookies[c.name] = c.value;
			return Object.entries(cookies).map(([name, value]) => ({
				name,
				value
			}));
		},
		/**
		* @param {string} name
		* @param {string} value
		* @param {import('./page/types.js').Cookie['options']} options
		*/
		set(name, value, options) {
			const illegal_characters = name.match(INVALID_COOKIE_CHARACTER_REGEX);
			if (illegal_characters) console.warn(`The cookie name "${name}" will be invalid in SvelteKit 3.0 as it contains ${illegal_characters.join(" and ")}. See RFC 2616 for more details https://datatracker.ietf.org/doc/html/rfc2616#section-2.2`);
			validate_options(options);
			set_internal(name, value, {
				...defaults,
				...options
			});
		},
		/**
		* @param {string} name
		*  @param {import('./page/types.js').Cookie['options']} options
		*/
		delete(name, options) {
			validate_options(options);
			cookies.set(name, "", {
				...options,
				maxAge: 0
			});
		},
		/**
		* @param {string} name
		* @param {string} value
		*  @param {import('./page/types.js').Cookie['options']} options
		*/
		serialize(name, value, options) {
			validate_options(options);
			let path = options.path;
			if (!options.domain || options.domain === url.hostname) path = resolve(normalized_url, path);
			return serialize(name, value, {
				...defaults,
				...options,
				path
			});
		}
	};
	/**
	* @param {URL} destination
	* @param {string | null} header
	*/
	function get_cookie_header(destination, header) {
		/** @type {Record<string, string>} */
		const combined_cookies = { ...initial_cookies };
		for (const key in new_cookies) {
			const cookie = new_cookies[key];
			if (!domain_matches(destination.hostname, cookie.options.domain)) continue;
			if (!path_matches(destination.pathname, cookie.options.path)) continue;
			const encoder = cookie.options.encode || encodeURIComponent;
			combined_cookies[cookie.name] = encoder(cookie.value);
		}
		if (header) {
			const parsed = parse(header, { decode: (value) => value });
			for (const name in parsed) combined_cookies[name] = parsed[name];
		}
		return Object.entries(combined_cookies).map(([name, value]) => `${name}=${value}`).join("; ");
	}
	/**
	* @param {string} name
	* @param {string} value
	* @param {import('./page/types.js').Cookie['options']} options
	*/
	function set_internal(name, value, options) {
		let path = options.path;
		if (!options.domain || options.domain === url.hostname) path = resolve(normalized_url, path);
		new_cookies[name] = {
			name,
			value,
			options: {
				...options,
				path
			}
		};
	}
	return {
		cookies,
		new_cookies,
		get_cookie_header,
		set_internal
	};
}
/**
* @param {string} hostname
* @param {string} [constraint]
*/
function domain_matches(hostname, constraint) {
	if (!constraint) return true;
	const normalized = constraint[0] === "." ? constraint.slice(1) : constraint;
	if (hostname === normalized) return true;
	return hostname.endsWith("." + normalized);
}
/**
* @param {string} path
* @param {string} [constraint]
*/
function path_matches(path, constraint) {
	if (!constraint) return true;
	const normalized = constraint.endsWith("/") ? constraint.slice(0, -1) : constraint;
	if (path === normalized) return true;
	return path.startsWith(normalized + "/");
}
/**
* @param {Headers} headers
* @param {import('./page/types.js').Cookie[]} cookies
*/
function add_cookies_to_headers(headers, cookies) {
	for (const new_cookie of cookies) {
		const { name, value, options } = new_cookie;
		headers.append("set-cookie", serialize(name, value, options));
		if (options.path.endsWith(".html")) {
			const path = add_data_suffix(options.path);
			headers.append("set-cookie", serialize(name, value, {
				...options,
				path
			}));
		}
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/fetch.js
/**
* @param {{
*   event: import('@sveltejs/kit').RequestEvent;
*   options: import('types').SSROptions;
*   manifest: import('@sveltejs/kit').SSRManifest;
*   state: import('types').SSRState;
*   get_cookie_header: (url: URL, header: string | null) => string;
*   set_internal: (name: string, value: string, opts: import('./page/types.js').Cookie['options']) => void;
* }} opts
* @returns {typeof fetch}
*/
function create_fetch({ event, options, manifest, state, get_cookie_header, set_internal }) {
	/**
	* @type {typeof fetch}
	*/
	const server_fetch = async (info, init) => {
		const original_request = normalize_fetch_input(info, init, event.url);
		let mode = (info instanceof Request ? info.mode : init?.mode) ?? "cors";
		let credentials = (info instanceof Request ? info.credentials : init?.credentials) ?? "same-origin";
		return options.hooks.handleFetch({
			event,
			request: original_request,
			fetch: async (info, init) => {
				const request = normalize_fetch_input(info, init, event.url);
				const url = new URL(request.url);
				if (!request.headers.has("origin")) request.headers.set("origin", event.url.origin);
				if (info !== original_request) {
					mode = (info instanceof Request ? info.mode : init?.mode) ?? "cors";
					credentials = (info instanceof Request ? info.credentials : init?.credentials) ?? "same-origin";
				}
				if ((request.method === "GET" || request.method === "HEAD") && (mode === "no-cors" && url.origin !== event.url.origin || url.origin === event.url.origin)) request.headers.delete("origin");
				if (url.origin !== event.url.origin) {
					if (`.${url.hostname}`.endsWith(`.${event.url.hostname}`) && credentials !== "omit") {
						const cookie = get_cookie_header(url, request.headers.get("cookie"));
						if (cookie) request.headers.set("cookie", cookie);
					}
					return fetch(request);
				}
				const prefix = assets || base;
				const decoded = decodeURIComponent(url.pathname);
				const filename = (decoded.startsWith(prefix) ? decoded.slice(prefix.length) : decoded).slice(1);
				const filename_html = `${filename}/index.html`;
				const is_asset = manifest.assets.has(filename) || filename in manifest._.server_assets;
				const is_asset_html = manifest.assets.has(filename_html) || filename_html in manifest._.server_assets;
				if (is_asset || is_asset_html) {
					const file = is_asset ? filename : filename_html;
					if (state.read) {
						const type = is_asset ? manifest.mimeTypes[filename.slice(filename.lastIndexOf("."))] : "text/html";
						return new Response(state.read(file), { headers: type ? { "content-type": type } : {} });
					} else if (read_implementation && file in manifest._.server_assets) {
						const length = manifest._.server_assets[file];
						const type = manifest.mimeTypes[file.slice(file.lastIndexOf("."))];
						return new Response(read_implementation(file), { headers: {
							"Content-Length": "" + length,
							"Content-Type": type
						} });
					}
					return await fetch(request);
				}
				if (credentials !== "omit") {
					const cookie = get_cookie_header(url, request.headers.get("cookie"));
					if (cookie) request.headers.set("cookie", cookie);
					const authorization = event.request.headers.get("authorization");
					if (authorization && !request.headers.has("authorization")) request.headers.set("authorization", authorization);
				}
				if (!request.headers.has("accept")) request.headers.set("accept", "*/*");
				if (!request.headers.has("accept-language")) request.headers.set("accept-language", event.request.headers.get("accept-language"));
				const response = await respond(request, options, manifest, {
					...state,
					depth: state.depth + 1
				});
				const set_cookie = response.headers.get("set-cookie");
				if (set_cookie) for (const str of set_cookie_parser.splitCookiesString(set_cookie)) {
					const { name, value, ...options } = set_cookie_parser.parseString(str, { decodeValues: false });
					set_internal(name, value, {
						path: options.path ?? (url.pathname.split("/").slice(0, -1).join("/") || "/"),
						encode: (value) => value,
						...options
					});
				}
				return response;
			}
		});
	};
	return (input, init) => {
		const response = server_fetch(input, init);
		response.catch(() => {});
		return response;
	};
}
/**
* @param {RequestInfo | URL} info
* @param {RequestInit | undefined} init
* @param {URL} url
*/
function normalize_fetch_input(info, init, url) {
	if (info instanceof Request) return info;
	return new Request(typeof info === "string" ? new URL(info, url) : info, init);
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/env_module.js
/** @type {string} */
var body;
/** @type {string} */
var etag;
/** @type {Headers} */
var headers;
/**
* @param {Request} request
* @returns {Response}
*/
function get_public_env(request) {
	body ??= `export const env=${JSON.stringify(public_env)}`;
	etag ??= `W/${Date.now()}`;
	headers ??= new Headers({
		"content-type": "application/javascript; charset=utf-8",
		etag
	});
	if (request.headers.get("if-none-match") === etag) return new Response(void 0, {
		status: 304,
		headers
	});
	return new Response(body, { headers });
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/route_config.js
/**
* Do a shallow merge (first level) of the config object
* @param {Array<import('types').SSRNode | undefined>} nodes
*/
function get_page_config(nodes) {
	/** @type {any} */
	let current = {};
	for (const node of nodes) {
		if (!node?.universal?.config && !node?.server?.config) continue;
		current = {
			...current,
			...node?.universal?.config,
			...node?.server?.config
		};
	}
	return Object.keys(current).length ? current : void 0;
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/respond.js
/** @type {import('types').RequiredResolveOptions['transformPageChunk']} */
var default_transform = ({ html }) => html;
/** @type {import('types').RequiredResolveOptions['filterSerializedResponseHeaders']} */
var default_filter = () => false;
/** @type {import('types').RequiredResolveOptions['preload']} */
var default_preload = ({ type }) => type === "js" || type === "css";
var page_methods = new Set([
	"GET",
	"HEAD",
	"POST"
]);
var allowed_page_methods = new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]);
/**
* @param {Request} request
* @param {import('types').SSROptions} options
* @param {import('@sveltejs/kit').SSRManifest} manifest
* @param {import('types').SSRState} state
* @returns {Promise<Response>}
*/
async function respond(request, options, manifest, state) {
	/** URL but stripped from the potential `/__data.json` suffix and its search param  */
	const url = new URL(request.url);
	if (options.csrf_check_origin) {
		if (is_form_content_type(request) && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request.headers.get("origin") !== url.origin) {
			const csrf_error = new HttpError(403, `Cross-site ${request.method} form submissions are forbidden`);
			if (request.headers.get("accept") === "application/json") return json(csrf_error.body, { status: csrf_error.status });
			return text(csrf_error.body.message, { status: csrf_error.status });
		}
	}
	if (options.hash_routing && url.pathname !== base + "/" && url.pathname !== "/[fallback]") return text("Not found", { status: 404 });
	const is_data_request = has_data_suffix(url.pathname);
	/** @type {boolean[] | undefined} */
	let invalidated_data_nodes;
	if (is_data_request) {
		url.pathname = strip_data_suffix(url.pathname) + (url.searchParams.get("x-sveltekit-trailing-slash") === "1" ? "/" : "") || "/";
		url.searchParams.delete(TRAILING_SLASH_PARAM);
		invalidated_data_nodes = url.searchParams.get(INVALIDATED_PARAM)?.split("").map((node) => node === "1");
		url.searchParams.delete(INVALIDATED_PARAM);
	}
	let rerouted_path;
	try {
		rerouted_path = options.hooks.reroute({ url: new URL(url) }) ?? url.pathname;
	} catch {
		return text("Internal Server Error", { status: 500 });
	}
	let decoded;
	try {
		decoded = decode_pathname(rerouted_path);
	} catch {
		return text("Malformed URI", { status: 400 });
	}
	/** @type {import('types').SSRRoute | null} */
	let route = null;
	/** @type {Record<string, string>} */
	let params = {};
	if (base && !state.prerendering?.fallback) {
		if (!decoded.startsWith(base)) return text("Not found", { status: 404 });
		decoded = decoded.slice(base.length) || "/";
	}
	if (decoded === `/${options.app_dir}/env.js`) return get_public_env(request);
	if (decoded.startsWith(`/${options.app_dir}`)) {
		const headers = new Headers();
		headers.set("cache-control", "public, max-age=0, must-revalidate");
		return text("Not found", {
			status: 404,
			headers
		});
	}
	if (!state.prerendering?.fallback) {
		const matchers = await manifest._.matchers();
		for (const candidate of manifest._.routes) {
			const match = candidate.pattern.exec(decoded);
			if (!match) continue;
			const matched = exec(match, candidate.params, matchers);
			if (matched) {
				route = candidate;
				params = decode_params(matched);
				break;
			}
		}
	}
	/** @type {import('types').TrailingSlash | void} */
	let trailing_slash = void 0;
	/** @type {Record<string, string>} */
	const headers = {};
	/** @type {Record<string, import('./page/types.js').Cookie>} */
	let cookies_to_add = {};
	/** @type {import('@sveltejs/kit').RequestEvent} */
	const event = {
		cookies: null,
		fetch: null,
		getClientAddress: state.getClientAddress || (() => {
			throw new Error(`@sveltejs/adapter-static does not specify getClientAddress. Please raise an issue`);
		}),
		locals: {},
		params,
		platform: state.platform,
		request,
		route: { id: route?.id ?? null },
		setHeaders: (new_headers) => {
			for (const key in new_headers) {
				const lower = key.toLowerCase();
				const value = new_headers[key];
				if (lower === "set-cookie") throw new Error("Use `event.cookies.set(name, value, options)` instead of `event.setHeaders` to set cookies");
				else if (lower in headers) throw new Error(`"${key}" header is already set`);
				else {
					headers[lower] = value;
					if (state.prerendering && lower === "cache-control") state.prerendering.cache = value;
				}
			}
		},
		url,
		isDataRequest: is_data_request,
		isSubRequest: state.depth > 0
	};
	/** @type {import('types').RequiredResolveOptions} */
	let resolve_opts = {
		transformPageChunk: default_transform,
		filterSerializedResponseHeaders: default_filter,
		preload: default_preload
	};
	try {
		if (route) {
			if (url.pathname === base || url.pathname === base + "/") trailing_slash = "always";
			else if (route.page) trailing_slash = get_option(await load_page_nodes(route.page, manifest), "trailingSlash");
			else if (route.endpoint) trailing_slash = (await route.endpoint()).trailingSlash;
			if (!is_data_request) {
				const normalized = normalize_path(url.pathname, trailing_slash ?? "never");
				if (normalized !== url.pathname && !state.prerendering?.fallback) return new Response(void 0, {
					status: 308,
					headers: {
						"x-sveltekit-normalize": "1",
						location: (normalized.startsWith("//") ? url.origin + normalized : normalized) + (url.search === "?" ? "" : url.search)
					}
				});
			}
			if (state.before_handle || state.emulator?.platform) {
				let config = {};
				/** @type {import('types').PrerenderOption} */
				let prerender = false;
				if (route.endpoint) {
					const node = await route.endpoint();
					config = node.config ?? config;
					prerender = node.prerender ?? prerender;
				} else if (route.page) {
					const nodes = await load_page_nodes(route.page, manifest);
					config = get_page_config(nodes) ?? config;
					prerender = get_option(nodes, "prerender") ?? false;
				}
				if (state.before_handle) state.before_handle(event, config, prerender);
				if (state.emulator?.platform) event.platform = await state.emulator.platform({
					config,
					prerender
				});
			}
		} else if (state.emulator?.platform) event.platform = await state.emulator.platform({
			config: {},
			prerender: !!state.prerendering?.fallback
		});
		const { cookies, new_cookies, get_cookie_header, set_internal } = get_cookies(request, url, trailing_slash ?? "never");
		cookies_to_add = new_cookies;
		event.cookies = cookies;
		event.fetch = create_fetch({
			event,
			options,
			manifest,
			state,
			get_cookie_header,
			set_internal
		});
		if (state.prerendering && !state.prerendering.fallback) disable_search(url);
		const response = await options.hooks.handle({
			event,
			resolve: (event, opts) => resolve(event, opts).then((response) => {
				for (const key in headers) {
					const value = headers[key];
					response.headers.set(key, value);
				}
				add_cookies_to_headers(response.headers, Object.values(cookies_to_add));
				if (state.prerendering && event.route.id !== null) response.headers.set("x-sveltekit-routeid", encodeURI(event.route.id));
				return response;
			})
		});
		if (response.status === 200 && response.headers.has("etag")) {
			let if_none_match_value = request.headers.get("if-none-match");
			if (if_none_match_value?.startsWith("W/\"")) if_none_match_value = if_none_match_value.substring(2);
			const etag = response.headers.get("etag");
			if (if_none_match_value === etag) {
				const headers = new Headers({ etag });
				for (const key of [
					"cache-control",
					"content-location",
					"date",
					"expires",
					"vary",
					"set-cookie"
				]) {
					const value = response.headers.get(key);
					if (value) headers.set(key, value);
				}
				return new Response(void 0, {
					status: 304,
					headers
				});
			}
		}
		if (is_data_request && response.status >= 300 && response.status <= 308) {
			const location = response.headers.get("location");
			if (location) return redirect_json_response(new Redirect(response.status, location));
		}
		return response;
	} catch (e) {
		if (e instanceof Redirect) {
			const response = is_data_request ? redirect_json_response(e) : route?.page && is_action_json_request(event) ? action_json_redirect(e) : redirect_response(e.status, e.location);
			add_cookies_to_headers(response.headers, Object.values(cookies_to_add));
			return response;
		}
		return await handle_fatal_error(event, options, e);
	}
	/**
	* @param {import('@sveltejs/kit').RequestEvent} event
	* @param {import('@sveltejs/kit').ResolveOptions} [opts]
	*/
	async function resolve(event, opts) {
		try {
			if (opts) resolve_opts = {
				transformPageChunk: opts.transformPageChunk || default_transform,
				filterSerializedResponseHeaders: opts.filterSerializedResponseHeaders || default_filter,
				preload: opts.preload || default_preload
			};
			if (options.hash_routing || state.prerendering?.fallback) return await render_response({
				event,
				options,
				manifest,
				state,
				page_config: {
					ssr: false,
					csr: true
				},
				status: 200,
				error: null,
				branch: [],
				fetched: [],
				resolve_opts
			});
			if (route) {
				const method = event.request.method;
				/** @type {Response} */
				let response;
				if (is_data_request) response = await render_data(event, route, options, manifest, state, invalidated_data_nodes, trailing_slash ?? "never");
				else if (route.endpoint && (!route.page || is_endpoint_request(event))) response = await render_endpoint(event, await route.endpoint(), state);
				else if (route.page) if (page_methods.has(method)) response = await render_page(event, route.page, options, manifest, state, resolve_opts);
				else {
					const allowed_methods = new Set(allowed_page_methods);
					if ((await manifest._.nodes[route.page.leaf]())?.server?.actions) allowed_methods.add("POST");
					if (method === "OPTIONS") response = new Response(null, {
						status: 204,
						headers: { allow: Array.from(allowed_methods.values()).join(", ") }
					});
					else response = method_not_allowed([...allowed_methods].reduce((acc, curr) => {
						acc[curr] = true;
						return acc;
					}, {}), method);
				}
				else throw new Error("This should never happen");
				if (request.method === "GET" && route.page && route.endpoint) {
					const vary = response.headers.get("vary")?.split(",")?.map((v) => v.trim().toLowerCase());
					if (!(vary?.includes("accept") || vary?.includes("*"))) {
						response = new Response(response.body, {
							status: response.status,
							statusText: response.statusText,
							headers: new Headers(response.headers)
						});
						response.headers.append("Vary", "Accept");
					}
				}
				return response;
			}
			if (state.error && event.isSubRequest) return await fetch(request, { headers: { "x-sveltekit-error": "true" } });
			if (state.error) return text("Internal Server Error", { status: 500 });
			if (state.depth === 0) return await respond_with_error({
				event,
				options,
				manifest,
				state,
				status: 404,
				error: new SvelteKitError(404, "Not Found", `Not found: ${event.url.pathname}`),
				resolve_opts
			});
			if (state.prerendering) return text("not found", { status: 404 });
			return await fetch(request);
		} catch (e) {
			return await handle_fatal_error(event, options, e);
		} finally {
			event.cookies.set = () => {
				throw new Error("Cannot use `cookies.set(...)` after the response has been generated");
			};
			event.setHeaders = () => {
				throw new Error("Cannot use `setHeaders(...)` after the response has been generated");
			};
		}
	}
}
//#endregion
//#region node_modules/@sveltejs/kit/src/utils/env.js
/**
* @param {Record<string, string>} env
* @param {{
* 		public_prefix: string;
* 		private_prefix: string;
* }} prefixes
* @returns {Record<string, string>}
*/
function filter_private_env(env, { public_prefix, private_prefix }) {
	return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith(private_prefix) && (public_prefix === "" || !k.startsWith(public_prefix))));
}
/**
* @param {Record<string, string>} env
* @param {{
* 		public_prefix: string;
*    private_prefix: string;
* }} prefixes
* @returns {Record<string, string>}
*/
function filter_public_env(env, { public_prefix, private_prefix }) {
	return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith(public_prefix) && (private_prefix === "" || !k.startsWith(private_prefix))));
}
//#endregion
//#region node_modules/@sveltejs/kit/src/runtime/server/index.js
/** @type {ProxyHandler<{ type: 'public' | 'private' }>} */
var prerender_env_handler = { get({ type }, prop) {
	throw new Error(`Cannot read values from $env/dynamic/${type} while prerendering (attempted to read env.${prop.toString()}). Use $env/static/${type} instead`);
} };
/** @type {Promise<any>} */
var init_promise;
var Server = class {
	/** @type {import('types').SSROptions} */
	#options;
	/** @type {import('@sveltejs/kit').SSRManifest} */
	#manifest;
	/** @param {import('@sveltejs/kit').SSRManifest} manifest */
	constructor(manifest) {
		/** @type {import('types').SSROptions} */
		this.#options = options;
		this.#manifest = manifest;
		set_manifest(manifest);
	}
	/**
	* @param {{
	*   env: Record<string, string>;
	*   read?: (file: string) => ReadableStream;
	* }} opts
	*/
	async init({ env, read }) {
		const prefixes = {
			public_prefix: this.#options.env_public_prefix,
			private_prefix: this.#options.env_private_prefix
		};
		const private_env = filter_private_env(env, prefixes);
		const public_env = filter_public_env(env, prefixes);
		set_private_env(prerendering ? new Proxy({ type: "private" }, prerender_env_handler) : private_env);
		set_public_env(prerendering ? new Proxy({ type: "public" }, prerender_env_handler) : public_env);
		set_safe_public_env(public_env);
		if (read) set_read_implementation(read);
		await (init_promise ??= (async () => {
			try {
				const module = await get_hooks();
				this.#options.hooks = {
					handle: module.handle || (({ event, resolve }) => resolve(event)),
					handleError: module.handleError || (({ error }) => console.error(error)),
					handleFetch: module.handleFetch || (({ request, fetch }) => fetch(request)),
					reroute: module.reroute || (() => {}),
					transport: module.transport || {}
				};
				if (module.init) await module.init();
			} catch (error) {
				throw error;
			}
		})());
	}
	/**
	* @param {Request} request
	* @param {import('types').RequestOptions} options
	*/
	async respond(request, options) {
		return respond(request, this.#options, this.#manifest, {
			...options,
			error: false,
			depth: 0
		});
	}
};
//#endregion
export { Server };
