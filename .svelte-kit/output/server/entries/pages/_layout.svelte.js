import "clsx";
import { o as onDestroy } from "../../chunks/index-server.js";
function ErrorBoundary($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    let hasError = false;
    function handleError(event) {
      event.preventDefault();
      hasError = true;
      event.error;
      console.error("[ErrorBoundary] Caught an error:", event.error);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("error", handleError);
    }
    onDestroy(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("error", handleError);
      }
    });
    if (hasError) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div role="alert" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; text-align: center; color: var(--color-text-primary);"><span style="font-size: 4rem; margin-bottom: 16px;">😿</span> <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Something went wrong</h1> <p style="color: var(--color-text-secondary); margin-bottom: 24px; max-width: 400px;">The cat knocked something over. Please try again.</p> <button style="padding: 10px 24px; border-radius: 8px; border: none; background: var(--color-accent-gradient); color: white; font-weight: 600; cursor: pointer; font-size: 1rem;">Try Again</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  ErrorBoundary($$renderer, {
    children: ($$renderer2) => {
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    }
  });
}
export {
  _layout as default
};
