const { flatRoutes } = require('remix-flat-routes')

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^marked.*/,
  ],  
  ignoredRouteFiles: ['**/*'],
  tailwind: true,
  future: {
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
  },
  routes(defineRoutes) {
    return flatRoutes('routes', defineRoutes)
  },
};