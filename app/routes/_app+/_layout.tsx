/*
    This is a layout that serves one purpose, don't let anyone not logged in access this folder.
    It has no UI because we handle that in the other folders under _app+
*/
import type {
    DataFunctionArgs,
} from "@vercel/remix";
import { 
    json, 
    redirect 
} from "@vercel/remix";
import { 
    Form,
    Link,
    NavLink,
    useLoaderData,
    Outlet 
} from "@remix-run/react";
import { isAuthenticated } from "~/auth.server";
import { cn } from '~/utils';

export async function loader({ request, context }: DataFunctionArgs) {
    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signout");
    }    

    const {user} = userAuthenticated;

    // session has expired so sign them out...
    if( !user.id ) {
        return redirect("/signout");
    }

    return json({ 
        user: user || {}, 
        meta: {
            title: `Dashboard`,
        },
    });     
}

export default function Layout() {
    const {user} = useLoaderData<typeof loader>();
    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="bg-slate-800 text-white body-font">
                <div className="container flex flex-wrap p-5 flex-col md:flex-row items-center">
                    <Link to="/" className="flex title-font font-medium items-center mb-4 md:mb-0">
                        <span className="ml-3 text-xl">Directed Stack</span>
                    </Link>
                    <nav className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400	flex flex-wrap items-center text-base justify-center">
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => cn(
                                isActive 
                                ? "text-blue-200 border border-blue-200 bg-blue-600 shadow-md"
                                : "text-white border border-white",
                                " mr-4 p-2 rounded-md hover:text-blue-400 hover:bg-gray-200"
                            )}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/notes" 
                            className={({ isActive }) => cn(
                                isActive 
                                ? "text-blue-200 dark:text-white border border-blue-200 bg-blue-600 shadow-md"
                                : "text-white dark:text-gray-200 border border-white",
                                " mr-4 p-2 rounded-md hover:text-blue-400 hover:bg-gray-200"
                            )}
                        >
                            My Notes
                        </NavLink>
                    </nav>
                    <Link to="/profile" className="mr-4">Edit Profile</Link>
                    <Form action="/signout" method="post">
                        <button
                            type="submit"
                            className="rounded bg-red-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                            aria-live="polite"
                        >
                            Logout
                        </button>
                    </Form>
                </div>
            </header>                
            <main className="flex h-full bg-white">
                <Outlet />
            </main>
        </div>
    )
}