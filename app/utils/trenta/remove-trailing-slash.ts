import { redirect } from "@vercel/remix";

export function removeTrailingSlash(url: URL) {
	if (url.pathname.endsWith("/") && url.pathname !== "/") {
		throw redirect(url.toString().slice(0, url.toString().length - 1));
	}
}