import { X as noop, I as getContext, N as head, D as escape_html, aa as store_get, ae as unsubscribe_stores } from "../../chunks/index.js";
import "clsx";
import "../../chunks/exports.js";
function get(key, parse = JSON.parse) {
  try {
    return parse(sessionStorage[key]);
  } catch {
  }
}
const SNAPSHOT_KEY = "sveltekit:snapshot";
const SCROLL_KEY = "sveltekit:scroll";
const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
if (is_legacy) {
  ({
    data: {},
    form: null,
    error: null,
    params: {},
    route: { id: null },
    state: {},
    status: -1,
    url: new URL("https://example.com")
  });
}
get(SCROLL_KEY) ?? {};
get(SNAPSHOT_KEY) ?? {};
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _error($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    head("1j96wlh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Oops! An Error Occurred</title>`);
      });
    });
    $$renderer2.push(`<div class="error-page svelte-1j96wlh"><div class="error-page__card svelte-1j96wlh"><div class="error-page__icon-wrapper svelte-1j96wlh"><span class="error-page__icon svelte-1j96wlh" role="img" aria-label="Sad cat">😿</span></div> <h1 class="error-page__status svelte-1j96wlh">${escape_html(store_get($$store_subs ??= {}, "$page", page).status || 500)}</h1> <h2 class="error-page__title svelte-1j96wlh">Something went wrong</h2> <p class="error-page__message svelte-1j96wlh">${escape_html(store_get($$store_subs ??= {}, "$page", page).error?.message || "We couldn't load the page. The cat might have knocked something over! 🐾")}</p> <div class="error-page__actions svelte-1j96wlh"><a href="/" class="error-page__button svelte-1j96wlh" id="error-back-button">Return to Dashboard</a></div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _error as default
};
