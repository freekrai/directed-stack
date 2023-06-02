/*
This file handles all our Markdoc rendering
*/
import type { RenderableTreeNodes } from "@markdoc/markdoc";

import { renderers } from "@markdoc/markdoc";
import * as React from "react";

type MarkdownProps = {
	content: RenderableTreeNodes;
	components?: Record<string, React.ComponentType>;
};

export function MarkdownView({ content, components = {} }: MarkdownProps) {
	return (
		<>{renderers.react(
			content, 
			React, { 
				components: { 
				} 
			})}</>
	)
}
