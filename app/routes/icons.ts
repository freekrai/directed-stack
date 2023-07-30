import type { DataFunctionArgs } from "@vercel/remix";
//import type { iconNames } from "~/components/icons/icons.json"
import spriteHref from "~/components/icons/icon.svg"

export async function loader({ request }: DataFunctionArgs) {
	let url = new URL(request.url);

	let name = url.searchParams.getAll("name");
	
	let body = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use href="${spriteHref}#${name}" /></svg>`;

	return new Response(body, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, s-maxage=31536000, max-age=60, immutable",
		},
	});
}