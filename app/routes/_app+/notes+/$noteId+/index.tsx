import type { ActionArgs, LoaderArgs } from "@vercel/remix";
import { redirect } from "@vercel/remix";
import { 
  Link, 
  Form, 
  useLoaderData 
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { parseISO, format } from 'date-fns';
import { CacheControl } from "~/utils/cache-control.server";
import { 
  isAuthenticated, 
  getDirectusClient, 
  readOne, 
  deleteOne 
} from "~/auth.server";
import { Button } from '~/components/core/ui/button'
import { Icon} from '~/components/icons'
import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/utils/md.server";

import { jsonHash } from 'remix-utils'

import {
  cn, useDoubleCheck
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
    
    return jsonHash({ 
      note,
      async body () {
        return parseMarkdown(note.body);
      }
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

    const { token } = userAuthenticated;

    if( token ) {
        await getDirectusClient({ token })
        invariant(params.noteId, "noteId not found");
        await deleteOne('notes', params.noteId);
    }
    return redirect("/notes");
}

export default function NoteDetailsPage() {
  const { body, note } = useLoaderData<typeof loader>();
	const doubleCheckDeleteNote = useDoubleCheck()

  return (
    <div>
      <h3 className="text-2xl font-bold">{note.title}</h3>
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
        Created: {note.created_at && format(parseISO(note.created_at), 'MMMM dd, yyyy')}
        {' • '}
        Last Updated: {note.updated_at && format(parseISO(note.updated_at), 'MMMM dd, yyyy')}
      </div>
			<article className="w-full prose dark:prose-dark max-w-none">
				<MarkdownView content={body} />
			</article>
      <hr className="my-4" />
      <div className="flex spacing-y-4">
        <Link 
          to={`/notes/${note.id}/edit`}
          className="mr-4 rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >Edit</Link>
        <Form method="post">
          <Button
            variant="destructive"
            className={
              cn(
                doubleCheckDeleteNote.doubleCheck ? 
                  "shadow-md rounded bg-red-700 border border-blue-700"
                : "rounded bg-red-400",
                "rounded text-white py-2 px-4")
            }
            {...doubleCheckDeleteNote.getButtonProps({
              type: 'submit',
            })}
          >
            <Icon name="trash">
              {doubleCheckDeleteNote.doubleCheck
                ? 'Are you sure?'
                : 'Delete'}
            </Icon>
          </Button>
        </Form>
      </div>
    </div>
  );
}