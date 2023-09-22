import { useEffect, useState } from "react";
import { useMatches } from "@remix-run/react";

let hydrating = true;

/**
 * Return a boolean indicating if the JS has been hydrated already.
 * When doing Server-Side Rendering, the result will always be false.
 * When doing Client-Side Rendering, the result will always be false on the
 * first render and true from then on. Even if a new component renders it will
 * always start with true.
 *
 * Example: Disable a button that needs JS to work.
 * ```tsx
 * let hydrated = useHydrated();
 * return (
 *   <button type="button" disabled={!hydrated} onClick={doSomethingCustom}>
 *     Click me
 *   </button>
 * );
 * ```
 */
export function useHydrated() {
  let [hydrated, setHydrated] = useState(() => !hydrating);

  useEffect(function hydrate() {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Determine if at least one of the routes is asking to load JS and return a
 * boolean.
 *
 * To request JS to be loaded, the route must export a handle with an object,
 * this object must contain a boolean property named `hydrate` or a function
 * named `hydrate`, in which case the function will be called with the `data`
 * from the loader of that route so it can be used to dynamically load or not
 * JavaScript.
 * @example
 * // This route needs to load JS
 * export let handle = { hydrate: true };
 * @example
 * // This route uses the data to know if it should load JS
 * export let handle = {
 *   hydrate(data: RouteData) {
 *     return data.needsJs;
 *   }
 * };
 */
export function useShouldHydrate() {
  return useMatches().some((match) => {
    if (!match.handle) return false;

    let { handle, data } = match;

    // handle must be an object to continue
    if (typeof handle !== "object") return false;
    if (handle === null) return false;
    if (Array.isArray(handle)) return false;

    // get hydrate from handle (it may not exists)
    let hydrate = handle.hydrate as
      | undefined
      | boolean
      | ((data: unknown) => boolean);

    if (!hydrate) return false;

    if (typeof hydrate === "function") return hydrate(data);
    return hydrate;
  });
}

export default useHydrated;
