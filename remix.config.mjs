import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/*'],
  serverDependenciesToBundle: [
    /^marked.*/,
  ],
  //serverDependenciesToBundle: "all",
  //serverMainFields: ["browser", "module", "main"],
  serverModuleFormat: "cjs",
  //serverModuleFormat: 'esm',
  //serverPlatform: "neutral", // default value, can be removed
  postcss: true,
  tailwind: true,
  future: {
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_headers: true,
  },
  routes: async defineRoutes => {
    return flatRoutes('routes', defineRoutes, {
      ignoredRouteFiles: [
        '.*',
        '**/*.css',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/__*.*',
      ],
    })
  },
  /*
  routes(defineRoutes) {
    return flatRoutes('routes', defineRoutes)
  },
  */
};