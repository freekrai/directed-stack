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
                />                
            </div>
			<ErrorList errors={form.errors} id={form.errorId} />
			<div className="flex-1 rounded-md border border-blue-600 bg-slate-100 p-4 mt-2">
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
