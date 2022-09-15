import { parse, transform, type Config } from "@markdoc/markdoc";
import { Callout, Fence } from "~/components/markdown";

export function parseMarkdown(markdown: string, options: Config = {}) {
	return transform( parse(markdown), {
		nodes: {
			fence: Fence.scheme
		},
		tags: { 
			callout: Callout.scheme 
		},
	});
}