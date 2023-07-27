import type { ActionArgs, LoaderArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Link, Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { parseISO, format } from 'date-fns';

import { isAuthenticated, getDirectusClient, getItemById, deleteItem } from "~/auth.server";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

export async function loader({ request, params }: LoaderArgs) {
    invariant(params.noteId, "noteId not found");

    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {user, token} = userAuthenticated;

    if( token ) {
        const directus = await getDirectusClient({ token })
        const note = await getItemById("notes", params.noteId);
        if (!note) {
            throw new Response("Not Found", { status: 404 });
        }
        let body = parseMarkdown(note.body);
        return json({ note, body });
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
        invariant(params.noteId, "noteId not found");
        await directus.request( deleteItem('notes', params.noteId) );
    }
    return redirect("/notes");
}

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        Created: {data.note.created_at && format(parseISO(data.note.created_at), 'MMMM dd, yyyy')}
        {' • '}
        Last Updated: {data.note.updated_at && format(parseISO(data.note.updated_at), 'MMMM dd, yyyy')}
      </div>
			<article className="w-full prose dark:prose-dark max-w-none">
				<MarkdownView content={data.body} />
			</article>
      <hr className="my-4" />
      <div className="flex spacing-y-4">
        <Link 
          to={`/notes/${data.note.id}/edit`}
          className="mr-4 rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >Edit</Link>
        <Form method="post">
          <button
            type="submit"
            className="rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
          >
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}