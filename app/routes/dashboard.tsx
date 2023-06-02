import type {
    LoaderArgs,
    HeadersFunction,
    V2_MetaFunction,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import * as React from "react";

import { isAuthenticated, getDirectusClient } from "~/auth.server";
import { CacheControl } from "~/utils/cache-control.server";
import Container from '~/components/layout/Container'

type IndexData = {
    token?: string;
    user: {
        email?: string;
    }
};

import getSeo from '~/seo';

export const meta: V2_MetaFunction = ({ data, matches }) => {
	//if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  	const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: 'Dashboard',
			description: '',
        	url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export let headers: HeadersFunction = () => {
    return { "Cache-Control": new CacheControl("swr").toString() };
};

export async function loader ({request}: LoaderArgs) {
    let errors = {};
    try {
        const userAuthenticated = await isAuthenticated(request, true);
        if (!userAuthenticated) {
            return redirect("/signin");
        }

        const {user, token} = userAuthenticated;
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
    const transition = useNavigation();

return (
    <Container>
        <div className="flex flex-col justify-center items-start w-full max-w-4xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
            <h2 className="text-3xl font-light">
            Welcome{" "}<strong className="font-bold">{user?.email}</strong>,
            </h2>
            <Form action="/signout" method="get">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-3"
                    aria-live="polite"
                    disabled={
                        transition.state !== "idle"
                    }
                >
                    {transition.state !== "idle" ? "👋" : "Sign out"}
                </button>
            </Form>
        </div>
    </Container>
);
}