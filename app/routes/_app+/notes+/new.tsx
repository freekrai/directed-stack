import type { ActionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { isAuthenticated, getDirectusClient, createOne } from "~/auth.server";
import { Editor } from "~/components/core/editor";

export async function action({ request }: ActionArgs) {
    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {user, token} = userAuthenticated;

    if( token ) {
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
        const note = await createOne('notes', {
          title,
          body,
          status: 'published'  
        });
        return redirect(`/notes/${note?.id}`);
    }
    return redirect("/notes")
}

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  let [hidePreview, setHidePreview] = React.useState(false)
  const [markup, setMarkup] = React.useState('');
  
  const handleChange = (newValue: string) => {
	  setMarkup(newValue)
  }  

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
      <input type="hidden" value={markup} id="body" name="body" />
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
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
            >Show Preview</button> : 
            <button
              type="button"
              name="showModel"
              onClick={()=>setHidePreview(true)}
              className="ml-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
            >Hide Preview</button>}
          </div>          
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
        >
          Save
        </button>
      </div>
    </Form>
  );
}