import { RemixBrowser } from '@remix-run/react'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

if (process.env.NODE_ENV === 'development') {
	import('~/utils/devtools').then(({ init }) => init())
}
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
	import('~/utils/monitoring.client').then(({ init }) => init())
}
if (process.env.NODE_ENV === 'development') {
	import('remix-development-tools').then(({ initRouteBoundariesClient }) => {
		initRouteBoundariesClient()
		startTransition(() => {
			hydrateRoot(document, <RemixBrowser />)
		})
	})
} else {
	startTransition(() => {
		hydrateRoot(document, <RemixBrowser />)
	})
}