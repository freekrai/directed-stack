import type { DataFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { isAuthenticated, getDirectusClient, readByQuery } from "~/auth.server";
import { CacheControl } from "~/utils/cache-control.server";

export async function loader ({request}: DataFunctionArgs) {
    let errors = {};
    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }

    const {user, token} = userAuthenticated;
    await getDirectusClient({ token });

    const notes = await readByQuery("notes", {
        filter: {
          created_by: {
            '_eq': user.id
          }
        },
        offset: 0,
        limit: -1,
        fields: ["*.*"],
        sort: "-updated_at",
    });

    return json({ 
        title: "Dashboard",
        user, 
        notes: notes || [],
    }, {
        headers: {
            "Cache-Control": new CacheControl("swr").toString() 
        },
    });    
}
export default function NotesPage() {
  const {user, notes} = useLoaderData<typeof loader>();

  return (
    <>

        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>
          <hr />

          {notes.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {notes.map((note: any) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    prefetch="intent"
                    to={note.id}
                  >
                    {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </>
  );
}