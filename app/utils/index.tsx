import * as React from 'react'


function getDomainUrl(request: Request) {
    const host =
      request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
    if (!host) {
      throw new Error('Could not determine domain URL.')
    }
    const protocol = host.includes('localhost') ? 'http' : 'https'
    return `${protocol}://${host}`
  }
  
  function removeTrailingSlash(s: string) {
    return s.endsWith('/') ? s.slice(0, -1) : s
  }
  
  function getDisplayUrl(requestInfo?: {origin: string; path: string}) {
    return getUrl(requestInfo).replace(/^https?:\/\//, '')
  }
  
  function getUrl(requestInfo?: {origin: string; path: string}) {
    return removeTrailingSlash(
      `${requestInfo?.origin ?? 'https://rogerstringer.com'}${
        requestInfo?.path ?? ''
      }`,
    )
  }

  import { useMatches } from "@remix-run/react";

//import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = React.useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any) {
  return user && typeof user === "object" && typeof user.user.email === "string";
}

export function useOptionalUser() {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export {
    getDomainUrl,
    getUrl,
    getDisplayUrl,
    removeTrailingSlash,
}
  