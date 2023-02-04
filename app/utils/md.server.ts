import { parse, transform, type Config } from "@markdoc/markdoc";
import { Callout, CodeBlock } from "~/components/markdown";

export function parseMarkdown(markdown: string, options: Config = {}) {
	return transform( parse(markdown), {
		nodes: {
			fence: CodeBlock.scheme
		},
		tags: { 
			callout: Callout.scheme 
		},
	});
}
