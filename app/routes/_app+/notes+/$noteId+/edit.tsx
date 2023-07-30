import type { 
  ActionArgs, 
  LoaderArgs, 
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { 
  Form, 
  useLoaderData, 
  useActionData
} from "@remix-run/react";
import { CacheControl } from "~/utils/cache-control.server";
import { isAuthenticated, getDirectusClient, readOne, updateOne } from "~/auth.server";
import * as React from "react";

import {
    invariant,
    useIsSubmitting,
} from '~/utils'

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.noteId, "noteId not found");

    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {token} = userAuthenticated;

    await getDirectusClient({ token })
    
    const note = await readOne("notes", params.noteId);
    if (!note) {
        throw new Response("Not Found", { status: 404 });
    }
    
    return json({ 
      note
    }, {
			headers: {
				"Cache-Control": new CacheControl("swr").toString() 
			},
		});
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.noteId, "noteId not found");

  const userAuthenticated = await isAuthenticated(request, true);
  if (!userAuthenticated) {
      return redirect("/signin");
  }

  const {token} = userAuthenticated;

  await getDirectusClient({ token })

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
      return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
      );
  }

  if (typeof body !== "string" || body.length === 0) {
      return json(
      { errors: { title: null, body: "Body is required" } },
      { status: 400 }
      );
  }
  
  updateOne('notes', params.noteId, {
      title,
      body
  });
  return redirect(`/notes/${params.noteId}`);
}

export default function NoteDetailsPage() {
  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  
  const isSubmitting = useIsSubmitting()
  
  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            defaultValue={note.title}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={12}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
            defaultValue={note.body}
          />

        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Form>
  );
}