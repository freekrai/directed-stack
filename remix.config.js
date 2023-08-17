const { flatRoutes } = require('remix-flat-routes')

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^marked.*/,
  ],
  ignoredRouteFiles: ['**/*'],
  serverModuleFormat: 'cjs',
  tailwind: true,
  future: {
    v2_routeConvention: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
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
};
