const { flatRoutes } = require('remix-flat-routes')

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^marked.*/,
  ],
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'cjs',
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
};