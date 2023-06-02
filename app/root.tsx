import type { 
  HeadersFunction, 
  LinksFunction, 
  LoaderArgs, 
  V2_MetaFunction 
} from "@vercel/remix";
import {
  Links,
  useLoaderData,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  ShouldRevalidateFunction,
  useRouteError,
} from "@remix-run/react";

import ErrorPage from '~/components/errorPage'

import { CacheControl } from "~/utils/cache-control.server";
import getSeo from '~/seo'

import {
  ThemeBody,
  ThemeHead,
  ThemeProvider,
  useTheme,
} from "~/utils/theme-provider";
import type { Theme } from "~/utils/theme-provider";
import { getThemeSession } from "~/utils/theme.server";

import {removeTrailingSlash, getDomainUrl } from '~/utils';
import { isAuthenticated } from "~/auth.server";

import tailwindStyles from "~/tailwind.css";

export const handle = {
  id: 'root',
}

export const meta: V2_MetaFunction = ({ data, matches }) => {
	return [
    getSeo({
      title: 'Directed Stack',
      url: removeTrailingSlash(`${data.requestInfo.origin}${data.requestInfo.path}`)
    }),
	]
}


export const links: LinksFunction = () => [
  { rel: "preconnect", href: "//fonts.gstatic.com", crossOrigin: "anonymous" },
  {rel: "stylesheet", href: tailwindStyles},
  { rel: "stylesheet", href: "//fonts.googleapis.com/css?family=Work+Sans:300,400,600,700&amp;lang=en" },
]

export type LoaderData = {
  user: false | { user: any; token: any; };
  theme: Theme | null;
  canonical: string | null;
  requestInfo: {
    origin: string
    path: string
  } | null;
};

export const loader = async ({ request }: LoaderArgs) => {
    const themeSession = await getThemeSession(request);

    const url = getDomainUrl(request);
    const path = new URL(request.url).pathname;

    const data: LoaderData = {
      user: await isAuthenticated(request),
      theme: themeSession.getTheme(),
      canonical: removeTrailingSlash(`${url}${path}`),
      requestInfo: {
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
      },
    };

  return data;
};
export type Loader = typeof loader;

export const headers: HeadersFunction = () => {
  return { "Cache-Control": new CacheControl("swr").toString() };
};

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={theme ?? ""}>
      <head>
        <Meta />
        <Links />
        <ThemeHead ssrTheme={Boolean(data.theme)} />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        />
        {data.requestInfo && <link
          rel="canonical"
          href={removeTrailingSlash(
            `${data.requestInfo.origin}${data.requestInfo.path}`,
          )}
        />}
      </head>
      <body>
        <Outlet />
        <ThemeBody ssrTheme={Boolean(data.theme)} />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<LoaderData>();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();
  let status = '500';
  let message = '';
  let stacktrace;

  //console.log(error);

/*
{
    status: 404,
    statusText: '',
    internal: false,
    data: {}
  }
*/
  // when true, this is what used to go to `CatchBoundary`
  if ( error.status === 404 ) {
    status = 404;
    message = 'Page Not Found';
  } else if (error instanceof Error) {
    status = '500';
    message = error.message;
    stacktrace = error.stack;
  } else {
    status = '500';
    message = 'Unknown Error';
  }
  return (
    <ErrorDocument title="Error!">
      <ErrorPage
        code={status}
        title={`There was an error`}
        message={message}
      />
    </ErrorDocument>
  );
}

function ErrorDocument({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html className="h-full" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}