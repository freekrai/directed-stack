import type {
    LoaderArgs,
    HeadersFunction,
    MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";

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

import { getSeo } from "~/seo";

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

let [seoMeta, seoLinks] = getSeo({
    title: "Dashboard",
    description: "Welcome to your Dashboard!"
});

export let meta: MetaFunction = () => {
    return {
        ...seoMeta,
    };
};

export const links = () => {
    return [...seoLinks];
};

export default function Dashboard() {
    let {user} = useLoaderData<typeof loader>();
    const transition = useTransition();

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