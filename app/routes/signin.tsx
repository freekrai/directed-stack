import type {
  ActionFunction,
  V2_MetaFunction,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import Container from '~/components/layout/Container'
import { safeRedirect, validateEmail } from "~/utils/";
import { login, createUserSession } from '~/auth.server';

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

import getSeo from '~/seo';

export const meta: V2_MetaFunction = ({ data, matches }) => {
	//let { meta } = data as SerializeFrom<typeof loader>;
  	const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: 'Login',
        	url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const redirectTo = safeRedirect(formData.get("redirectTo"), "/notes");
    const remember = formData.get("remember");

    if (!validateEmail(email)) {
        return json(
            { errors: { email: "Email is invalid", password: null } },
            { status: 400 }
        );
    }

    if (typeof password !== "string" || password.length === 0) {
        return json(
            { errors: { email: null, password: "Password is required" } },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return json(
            { errors: { email: null, password: "Password is too short" } },
            { status: 400 }
        );
    }

    try { 
        const user = await login({
            email, 
            password,
        });
        // we're logged so so save the session and redirect
        if( user ){
            return createUserSession({
                request,
                userId: user.access_token,
                user: {
                    access_token: user.access_token,
                    refresh_token: user.refresh_token || "",
                    expires: user.expires || 900000,
                },
                remember: remember === "on" ? true : false,
                redirectTo,
            });
        }
    } catch(e){
        return json<ActionData>(
            { errors: { password: "Invalid Password" } },
            { status: 400 }
        );
    }
}
    
export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/notes";
    const actionData = useActionData() as ActionData;
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    
    React.useEffect(() => {
      if (actionData?.errors?.email) {
        emailRef.current?.focus();
      } else if (actionData?.errors?.password) {
        passwordRef.current?.focus();
      }
    }, [actionData]);
    
    return (
      <Container>
        <div className="min-h-full w-full flex flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-indigo-100 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" method="POST">
              <input type="hidden" name="redirectTo" value={redirectTo} />
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      ref={emailRef}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-invalid={actionData?.errors?.email ? true : undefined}
                      aria-describedby="email-error"    
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {actionData?.errors?.email && (
                    <div className="pt-1 text-red-700" id="email-error">
                      {actionData.errors.email}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      ref={passwordRef}
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      aria-invalid={actionData?.errors?.password ? true : undefined}
                      aria-describedby="password-error"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {actionData?.errors?.password && (
                    <div className="pt-1 text-red-700" id="password-error">
                      {actionData.errors.password}
                    </div>
                  )}
                </div>
    
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign in
                  </button>
                  <div className="text-sm mt-4">
                    <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Don't have an account? Sign up instead
                    </Link>
                  </div>
                </div>
              </form>    
            </div>
          </div>
        </div>
      </Container>
    );
}