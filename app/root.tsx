import type { HeadersFunction, LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  useLoaderData,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { CacheControl } from "~/utils/cache-control.server";
import { getSeo } from "~/seo";

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

import tailwindStyles from "./styles/global.css"

let [seoMeta, seoLinks] = getSeo();

export const handle = {
  id: 'root',
}

export const meta: MetaFunction = () => ({
  ...seoMeta,
  charset: "utf-8",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  ...seoLinks,
  { rel: "preconnect", href: "//fonts.gstatic.com", crossOrigin: "anonymous" },
  {rel: "stylesheet", href: tailwindStyles},
  { rel: "stylesheet", href: "//fonts.googleapis.com/css?family=Work+Sans:300,400,600,700&amp;lang=en" },
]

export type LoaderData = {
  user: false | { user: any; token: any; };
  theme: Theme | null;
  requestInfo: {
    origin: string
    path: string
  } | null;
};

export const loader = async ({ request }: LoaderArgs) => {
    const themeSession = await getThemeSession(request);

    const data: LoaderData = {
      user: await isAuthenticated(request),
      theme: themeSession.getTheme(),
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