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

import { NoteEditor, action } from './__note-editor'

export { action }

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

export default function NoteDetailsPage() {
  const { note } = useLoaderData<typeof loader>();

  return (
    <NoteEditor note={note} />
  );
}
