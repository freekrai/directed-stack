import type {
    DataFunctionArgs,
    HeadersFunction,
    MetaFunction,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import * as React from "react";

import { isAuthenticated } from "~/auth.server";
import { CacheControl } from "~/utils/cache-control.server";

import getSeo from '~/seo';

export const meta: MetaFunction = ({ data, matches }) => {
	//if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	//const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: 'Dashboard',
			description: '',
        	//url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export let headers: HeadersFunction = () => {
    return { "Cache-Control": new CacheControl("swr").toString() };
};

export async function loader ({request}: DataFunctionArgs) {
    let errors = {};
    try {
        const userAuthenticated = await isAuthenticated(request, true);
        if (!userAuthenticated) {
            return redirect("/signin");
        }

        const {user} = userAuthenticated;
        return json({ 
            title: "Dashboard",
            user, 
        }, {
            headers: {
                "Cache-Control": new CacheControl("swr").toString() 
            },
        });    
    } catch (error) {
        console.log("error", error);
        return json({ 
            user: null,
            errors 
        }, { status: 500 });
    }
}

export default function Dashboard() {
    let {user} = useLoaderData<typeof loader>();

    return (
        <>
            <div className="flex flex-col justify-center items-start w-full max-w-4xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
                <h2 className="text-3xl font-light">
                    Select a note to view or edit, or <Link to="/notes/new" className="text-blue-600">Create a new note</Link>
                </h2>
            </div>
        </>
    );
}    