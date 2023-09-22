import type {
    DataFunctionArgs,
    HeadersFunction,
    MetaFunction,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { 
    Form, 
    useLoaderData,
    useActionData,
    useNavigation,
    useFormAction,
    useNavigate,
} from "@remix-run/react";

import PageHeader from '~/components/core/pageHeader';
import Dialog from '~/components/core/Dialog'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/core/ui/accordion" 

import { getDomainUrl, validateEmail } from '~/utils';

import * as React from "react";

import { isAuthenticated, getDirectusClient, readMe, updateMe } from "~/auth.server";

import { CacheControl } from "~/utils/cache-control.server";

import { z } from "zod"
import { zfd } from "zod-form-data"

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

const schema = zfd.formData({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email().min(5),
  password: z.string().optional(),
  password2: z.string().optional(),
  //description: z.string().optional(),
})

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
        
        const {user, token} = userAuthenticated;
        const directus = await getDirectusClient({ token })
        const profile = await directus.request(
            readMe({
              fields: ['*'],
            })
        );
      
        return json({ 
            title: "My Profile",
            meta: {
                title: `Welcome, ${user.email}`,
            },
            user: user || {}, 
            profile: profile || {},
        }, {
            headers: {
                "Cache-Control": new CacheControl("swr").toString() 
            },
        });    
    } catch (error) {
        console.log("error", error);
        return json({ 
            user: null,
            profile: null,
            errors 
        }, { status: 500 });
    }
}

export const handle = {
	id: 'dashboard',
}   

export const meta: MetaFunction = ({ data, matches }) => {
	//let rootModule = matches.find(match => match.route.id === 'root')
	return [
		//...(rootModule?.meta ?? [])?.filter(meta => !('title' in meta)),
		{ title: `My Profile | Directed Stack`  },
		{ description: 'Welcome to your Dashboard'},
	];
}	

export async function action({ request, params }: DataFunctionArgs) {
    const userAuthenticated = await isAuthenticated(request, true);
    if (!userAuthenticated) {
        return redirect("/signin");
    }    
    
    const {token} = userAuthenticated;

    // export async function patchAPI(path: string, urlParamsObject: {}, options = {}, payload = {}){
    if( token ) {
        const directus = await getDirectusClient({ token })

        const items = schema.parse(await request.formData());

        console.log("items ----> ", items);

        const siteUrl = `${getDomainUrl(request)}`
        let changePassword = false;

        if (typeof items.password === "string" && items.password.length > 0) {
            if (items.password.length < 8) {
                return json(
                { errors: { email: null, password: "Password is too short" } },
                { status: 400 }
                );
            }
            if (typeof items.password2 === "string" && items.password2.length> 0) {
                if( items.password !== items.password2 ) {
                    return json(
                        { errors: { password: "Passwords do not match!!" } },
                        { status: 400 }
                    );
                }
                changePassword = true;
            }
        }
    
        if (!validateEmail(items.email)) {
          return json(
            { errors: { email: "Email is invalid", password: null } },
            { status: 400 }
          );
        }

        if( changePassword ) {
            await directus.request(
                updateMe({
                    first_name: items.firstname,
                    last_name: items.lastname,
                    email: items.email,
                    password: items.password,
                })
            );
            return redirect("/signout");
        } else {
            await directus.request(
                updateMe({
                    first_name: items.firstname,
                    last_name: items.lastname,
                    email: items.email,
                })
            );
        }
        return json({
          success: {
            message: "Profile updated",
          }
        },
        { 
            status: 200 
        });
        //return redirect(`/profile`)
    }
    return redirect("/dashboard")
}

export default function Profile() {
    let {user} = useLoaderData<typeof loader>();

    const navigate = useNavigate();

    const [isOpen, setIsOpen] = React.useState(true);

    function handleClose() {
        setIsOpen(false);
        navigate(`/dashboard`);
    }

    const actionData = useActionData();// as ActionData;
    const formAction = useFormAction()
    const navigation = useNavigation()

    const firstnameRef = React.useRef<HTMLInputElement>(null);
    const lastnameRef = React.useRef<HTMLInputElement>(null);
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const [saved, setSaved] = React.useState(false);

    React.useEffect(() => {
        if (actionData?.errors?.firstname) {
            firstnameRef.current?.focus();
        }
        if (actionData?.errors?.lastname) {
            lastnameRef.current?.focus();
        }
        if (actionData?.errors?.password) {
            passwordRef.current?.focus();
        }
        if (actionData?.errors?.email) {
            emailRef.current?.focus();
        }
        if(actionData?.success?.message) {
            setSaved(true);
        }
    }, [actionData]);

    return (
        <Dialog 
            isOpen={isOpen} 
            setIsOpen={setIsOpen}
            handleClose={handleClose}
            title={`My Profile`}
        >
			<>
                <div className="pb-16">
                    <div className="px-4 mt-6 sm:px-6 lg:px-8">
                        {saved && <SuccessMsg />}
                        <Form method="post" className="space-y-8 divide-y divide-gray-200">
                            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                                <div className="space-y-6 sm:space-y-5">
                                    <div className="space-y-6 sm:space-y-5">
                                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                First name
                                            </label>
                                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    name="firstname"
                                                    id="firstname"
                                                    ref={firstnameRef}
                                                    required
                                                    defaultValue={user.first_name}
                                                    autoComplete="given-name"
                                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            {actionData?.errors?.firstname && (
                                                <div className="pt-1 text-red-700" id="email-error">
                                                {actionData.errors.firstname}
                                                </div>
                                            )}
                                        </div>
                            
                                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                Last name
                                            </label>
                                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    name="lastname"
                                                    id="lastname"
                                                    ref={lastnameRef}
                                                    required
                                                    defaultValue={user.last_name}
                                                    autoComplete="family-name"
                                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            {actionData?.errors?.lastname && (
                                                <div className="pt-1 text-red-700" id="email-error">
                                                {actionData.errors.lastname}
                                                </div>
                                            )}                            
                                        </div>
                            
                                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                            Email address
                                            </label>
                                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                ref={emailRef}
                                                defaultValue={user.email}
                                                required
                                                aria-invalid={actionData?.errors?.email ? true : undefined}
                                                aria-describedby="email-error"    
                                                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            </div>
                                            {actionData?.errors?.email && (
                                                <div className="pt-1 text-red-700" id="email-error">
                                                {actionData.errors.email}
                                                </div>
                                            )}                            
                                        </div> 
                                        <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>
                                                Change Password
                                            </AccordionTrigger>
                                            <AccordionContent className="bg-blue-50 border border-indigo-400 rounded-md p-4">
                                                <div>
                                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Leave blank to not change.</p>
                                                </div>
                                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                    New Password
                                                    </label>
                                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                                        <input
                                                            id="password"
                                                            name="password"
                                                            ref={passwordRef}
                                                            type="password"
                                                            autoComplete="off"
                                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                                    Confirm Password
                                                    </label>
                                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                                        <input
                                                            id="password"
                                                            name="password2"
                                                            type="password"
                                                            autoComplete="off"
                                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    {actionData?.errors?.password && (
                                                        <div className="pt-1 text-red-700" id="email-error">
                                                        {actionData.errors.password}
                                                        </div>
                                                    )}                            
                                                </div>        
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>                                                                                                          
                                    </div>            
                                </div>
                                <div className="pt-5">
                                    <div className="flex justify-end">
                                        <button
                                        type="button"
                                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                        Cancel
                                        </button>
                                        <button
                                        type="submit"
                                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                        {navigation.state !== "idle" ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Form>   
                    </div>
                </div>
            </>
        </Dialog>
    );
}

const ErrorBox = (errors: string[]) => (
    <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
            <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">There were {errors.length} errors with your submission</h3>
                <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc space-y-1 pl-5">
                        {errors && errors.map(e => (
                            <li key={e}>{e}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
)

const SuccessMsg = () => (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">Profile Updated</h3>
        </div>
      </div>
    </div>
)