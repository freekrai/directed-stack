import type { 
  ActionArgs, 
  LoaderArgs, 
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, useLoaderData, useActionData, useFormAction, useNavigation} from "@remix-run/react";
import invariant from "tiny-invariant";

//import { deleteNote, getNote } from "~/models/note.server";
import { isAuthenticated, getDirectusClient, readOne, updateItem } from "~/auth.server";
import * as React from "react";

import MarkdownInput from "~/components/core/ui/MarkdownInput";
import useLocalStorage from "~/hooks/useLocalStorage";

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.noteId, "noteId not found");

    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {user, token} = userAuthenticated;

    if( token ) {
        const directus = await getDirectusClient({ token })
        const note = await readOne("notes", params.noteId);
        if (!note) {
            throw new Response("Not Found", { status: 404 });
        }
        return json({ note});
    }
    return json({});
}

export async function action({ request, params }: ActionArgs) {
    invariant(params.noteId, "noteId not found");

    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {user, token} = userAuthenticated;

    if( token ) {
        const directus = await getDirectusClient({ token })

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
        await directus.request(
          updateItem(
            'notes', 
            params.noteId, 
            {
              title,
              body
            }
          )
        );
        return redirect(`/notes/${params.noteId}`);
    }
    return redirect("/notes")
}

export default function NoteDetailsPage() {
	const navigation = useNavigation()
	const formAction = useFormAction()

  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useLocalStorage(data.note.id, data.note.body);

  const isSubmitting = navigation.state === 'submitting' && navigation.formAction === formAction && navigation.formMethod === 'POST'

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
            defaultValue={data.note.title}
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
          <div className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6">
            <MarkdownInput
              className="col-span-12"
              rows={6}
              editor="monaco"
              editorLanguage="markdown"
              editorTheme="vs-dark"
              editorSize="screen"
              editorFontSize={14}
              name="body"
              value={content}
              setValue={(e) => setContent(e.toString())}
            />
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Form>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}