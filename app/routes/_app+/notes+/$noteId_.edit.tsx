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

import { NoteEditor } from '~/routes/resources+/note-editor'

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

  return (
    <NoteEditor note={note} />
  );
}