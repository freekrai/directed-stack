import { flatRoutes } from "remix-flat-routes";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/*'],
  serverDependenciesToBundle: [
    // /^marked.*/,
  ],
  //serverModuleFormat: "cjs",
  tailwind: true,
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