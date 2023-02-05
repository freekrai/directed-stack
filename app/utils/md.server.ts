import { parse, transform, type Config } from "@markdoc/markdoc";
import { Callout, Step, CodeBlock } from "~/components/markdown";

export function parseMarkdown(markdown: string, options: Config = {}) {
	return transform( parse(markdown), {
		nodes: {
			fence: CodeBlock.scheme,
			step: Step.scheme			
		},
		tags: { 
			callout: Callout.scheme,
			step: Step.scheme
		},
	});
}
