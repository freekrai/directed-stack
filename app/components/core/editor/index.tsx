//import type { DataFunctionArgs } from "@vercel/remix";
//import { json } from "@vercel/remix";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import { Button } from "./buttons";
import { Provider, useEditor } from "./use-editor";
import { marked } from "marked";

export function Editor({ content="", onChange, hidePreview=false}: {content: string, onChange: (value: string) => void, hidePreview?: boolean}) {
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current);

	let stateValue = state.value;// || content;

	// populate state on first load with the content we've passed into the editor...
	if( content && !state.value ) {
		const value = content.toString();
		dispatch({ type: "write", payload: { value } });
	}

	let providerValue = useMemo(() => {
		return { element: $textarea, state, dispatch };
	}, [dispatch, state]);

	useEffect(() => {
/*		
		submit(
			{ content: stateValue },
			{ action: "/components/editor", method: "post" }
		);
*/		
		onChange(stateValue);		
	}, [onChange, stateValue]);

	let gcols = hidePreview ? 'sm:grid-cols-1' : 'sm:grid-cols-2'; 
	return (
		<Provider value={providerValue}>
			<div className={`grid h-[calc(100vh-90px-32px)] gap-4 ${gcols} rounded-md border border-neutral-300 bg-gray-100 p-4`}>
				<div className="flex h-full flex-col rounded-md border border-neutral-300 bg-white">
					<div role="menubar" className="flex items-center justify-between p-2">
						<div className="flex items-center gap-x-1 text-gray-700">
							<svg width={16} height={16}>
								<use href="/icons?name=markdown#markdown" />
							</svg>
							<span className="text-xs sr-only">Markdown is supported</span>
						</div>

						<div className="flex items-center justify-end">
							<Button.Bold />
							<Button.Italic />
							<Button.Link />
							<Button.UnorderedList />
							<Button.OrderedList />
							<Button.Code />
							<Button.CodeBlock />	
							<Button.Quote />
							<Button.Image />
						</div>
					</div>
					<textarea
						ref={$textarea}
						value={stateValue}
						onChange={(event) => {
							let value = event.currentTarget.value;
							dispatch({ type: "write", payload: { value } });
						}}
						className="mx-2 mb-2 flex-grow resize-none rounded-md border-none font-mono ring-blue-600 focus:outline-none focus:ring-2"
					/>
				</div>
				{!hidePreview && <div className="prose prose-blue max-w-prose overflow-y-auto rounded-md border border-neutral-300 bg-gray-100 p-2">
					<div
						dangerouslySetInnerHTML={{
							__html: marked(content) ?? "",
						}}
					/>
				</div>}
			</div>
		</Provider>
	);
}
