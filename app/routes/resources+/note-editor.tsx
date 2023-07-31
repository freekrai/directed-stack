import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { redirect, json, type DataFunctionArgs } from '@vercel/remix'
import { useFetcher } from '@remix-run/react'
import { z } from 'zod'
import { Button } from '~/components/core/ui/button'
import { StatusButton } from '~/components/core/ui/status-button'
import { Icon } from '~/components/icons'
import * as React from "react";
import { isAuthenticated, getDirectusClient, createOne, updateOne } from "~/auth.server";
import { ErrorList, Field } from '~/components/core/forms'

import {
    invariant,
    useIsSubmitting,
} from '~/utils'

import { Editor } from "~/components/core/editor";

export const NoteEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	body: z.string().min(1),
})

export async function action({ request }: DataFunctionArgs) {
    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }
  
    const {token} = userAuthenticated;
  
    await getDirectusClient({ token })
  
	const formData = await request.formData()
	const submission = parse(formData, {
		schema: NoteEditorSchema,
		acceptMultipleErrors: () => true,
	})
	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const)
	}
	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 })
	}
	let note: { id: string }

	const { title, body, id } = submission.value

	const data = {
		title: title,
		body: body,
	}

	const select = {
		id: true,
		owner: {
			select: {
				username: true,
			},
		},
	}
	if (id) {
        await updateOne('notes', id, {
            title,
            body
        });
        return redirect(`/notes/${id}`);
	} else {
        const newNote = await createOne('notes', {
            title,
            body
        });
        return redirect(`/notes/${newNote.id}`);
	}
}

export function NoteEditor({
	note,
}: {
	note?: { id: string; title: string; body: string }
}) {
	const noteEditorFetcher = useFetcher<typeof action>()

    let [hidePreview, setHidePreview] = React.useState(false)
    const [markup, setMarkup] = React.useState(note?.body || "" );
    
    const handleChange = (newValue: string) => {
        setMarkup(newValue)
    }  
  
    const isSubmitting = useIsSubmitting()

	const [form, fields] = useForm({
		id: 'note-editor',
		constraint: getFieldsetConstraint(NoteEditorSchema),
		lastSubmission: noteEditorFetcher.data?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: NoteEditorSchema })
		},
		defaultValue: {
			title: note?.title,
			body: note?.body,
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<noteEditorFetcher.Form
			method="post"
			action="/resources/note-editor"
			className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
			{...form.props}
		>
			<input name="id" type="hidden" value={note?.id} />
            <input type="hidden" value={markup} id="body" name="body" />
			<Field
				labelProps={{ children: 'Title' }}
				inputProps={{
					...conform.input(fields.title),
					autoFocus: true,
				}}
				errors={fields.title.errors}
				className="flex flex-col gap-y-2"
			/>
            <div>
                <Editor 
                    content={markup}
                    onChange={handleChange}
                    hidePreview={hidePreview}
                />
                <div className="flex-1 mt-2 rounded-md border border-neutral-300 bg-gray-100 p-4">
                    {hidePreview ? <button
                        type="button"
                        name="showModel"
                        onClick={()=>setHidePreview(false)}
                        className="ml-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                    >
                        <Icon name="eye" />
                        Show Preview
                    </button> : 
                    <button
                        type="button"
                        name="showModel"
                        onClick={()=>setHidePreview(true)}
                        className="ml-5 rounded bg-green-500 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400 disabled:bg-green-300"
                    >
                        <Icon name="eye-off" />
                        Hide Preview
                    </button>}
                </div>
            </div>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="pt-5">
                <div className="flex justify-end">
                    <Button
                        variant="destructive"
                        type="reset"
                        className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
                    >
                        <Icon name="x-circle" className="scale-125 max-md:scale-150">
                            <span className="max-md:hidden">Reset</span>
                        </Icon>
                    </Button>
                    <StatusButton
                        status={
                            noteEditorFetcher.state === 'submitting'
                                ? 'pending'
                                : noteEditorFetcher.data?.status ?? 'idle'
                        }
                        type="submit"
                        disabled={noteEditorFetcher.state !== 'idle'}
                        className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0 text-white"
                    >
                        <Icon name="arrow-right" className="scale-125 max-md:scale-150">
                            <span className="max-md:hidden">Submit</span>
                        </Icon>
                    </StatusButton>
                </div>
			</div>
		</noteEditorFetcher.Form>
	)
}