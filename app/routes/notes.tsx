import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { isAuthenticated, getDirectusClient } from "~/auth.server";
import { CacheControl } from "~/utils/cache-control.server";

export async function loader ({request}: LoaderArgs) {
    let errors = {};
    try {
        const userAuthenticated = await isAuthenticated(request, true);
        if (!userAuthenticated) {
            return redirect("/signin");
        }

        const {user, token} = userAuthenticated;

        if( token ) {
            const directus = await getDirectusClient({ token })
            const results = await directus.items("notes").readByQuery({
                filter: {
                  created_by: {
                    '_eq': user.id
                  }
                },
                offset: 0,
                limit: -1,
                fields: ["*.*"],
                meta: 'total_count',
                sort: ["-updated_at"],
            });
            return json({ 
                title: "Dashboard",
                user, 
                notes: results.data || [],
            }, {
                headers: {
                    "Cache-Control": new CacheControl("swr").toString() 
                },
            });    
        }
    } catch (error) {
        console.log("error", error);
        return json({ 
            user: null,
            notes: null,
            errors 
        }, { status: 500 });
    }
}
export default function NotesPage() {
  const {user, notes} = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold text-white">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Link 
            to="/"
            className="rounded bg-blue-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >Home</Link>
        <Form action="/signout" method="post">
            <button
                type="submit"
                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                aria-live="polite"
            >
                Logout
            </button>
        </Form>        
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>
          <hr />

          {notes.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {notes.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    prefetch="intent"
                    to={note.id}
                  >
                    📝 {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}