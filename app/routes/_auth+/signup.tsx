import type {
  ActionFunction,
  V2_MetaFunction,
} from "@vercel/remix";
import { json } from "@vercel/remix";
import { 
  Link, 
  useFetcher,
  useSearchParams 
} from "@remix-run/react";
import * as React from "react";
import { conform, useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { z } from 'zod'

import { getDirectusClient, createUser } from '~/services/directus.server';
import { passwordSchema, emailSchema } from '~/utils/user-validation'
import { checkboxSchema } from '~/utils/zod-extensions'
import { StatusButton } from '~/components/core/ui/status-button'
import { CheckboxField, ErrorList, Field } from '~/components/core/forms'

import Container from '~/components/layout/Container'
import { login, createUserSession } from '~/auth.server';
import { invariant } from '~/utils';

import getSeo from '~/seo';

const signupFormSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
  confirmPassword: passwordSchema,
	redirectTo: z.string().optional(),
	remember: checkboxSchema(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password does not match',
  path: ['confirmPassword'],
});

export const meta: V2_MetaFunction = ({ data, matches }) => {
	//let { meta } = data as SerializeFrom<typeof loader>;
  	const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: 'Sign Up',
        	url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export const action: ActionFunction = async ({ request }) => {
    invariant(process.env.DIRECTUS_USER_ROLE, "No user role specified");

    const formData = await request.formData();

    const submission = parse(formData, {
      schema: signupFormSchema,
      acceptMultipleErrors: () => true,
    })
  
    if (submission.intent !== 'submit') {
      return json({ status: 'idle', submission } as const)
    }
    if (!submission.value) {
      return json({ status: 'error', submission } as const, { status: 400 })
    }

    const { 
      email, 
      password,
      //confirmPassword,
      redirectTo,
      remember,
    } = submission.value

    try {
      // 1. create user
      const directus = await getDirectusClient();
      const newUser = await directus.request(
        createUser({
          email: email,
          password: password,
          role: process.env.DIRECTUS_USER_ROLE  
        })
      );

      // 2. log user in
      const user = await login({
          email, 
          password,
      });
      if( user ){
          return createUserSession({
              request,
              userId: user.access_token,
              user: {
                  access_token: user.access_token,
                  refresh_token: user.refresh_token || "",
                  expires: user.expires || 900000,
              },
              remember: remember ? true : false,
              redirectTo: redirectTo ? redirectTo : '/dashboard',
          });
      }
      // no redirect, so login was wrong...
      return json({ status: 'error', submission } as const, { status: 400 })
    } catch(error) {
      // something broke...
      return json({ status: 'error', submission } as const, { status: 400 })
    }
}
    
export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";    

    const signupFetcher = useFetcher<typeof action>()
    const [form, fields] = useForm({
      id: 'sigin-form',
      constraint: getFieldsetConstraint(signupFormSchema),
      lastSubmission: signupFetcher.data?.submission,
      onValidate({ formData }) {
        return parse(formData, { schema: signupFormSchema })
      },
      defaultValue: {
        redirectTo,
      },
      shouldRevalidate: 'onBlur',
    })
    
    return (
      <Container>
        <div className="min-h-full w-full flex flex-col justify-center">
          <div className="text-center">
            <h1 className="text-h1">Let's start your journey!</h1>
            <p className="mt-3 text-body-md text-muted-foreground">
              
            </p>
			    </div>            
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-indigo-100 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <signupFetcher.Form
                method="post"
                action="/signup"
                className="space-y-6"
                {...form.props}
              >               
                <input {...conform.input(fields.redirectTo)} type="hidden" />
                <Field
                  labelProps={{ children: 'Email' }}
                  inputProps={{
                    ...conform.input(fields.email),
                    autoFocus: true,
                  }}
                  errors={fields.email.errors}
                  className="mt-2 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <Field
                  labelProps={{ children: 'Password' }}
                  inputProps={{
                    ...conform.input(fields.password),
                    type: "password",
                    autoFocus: true,
                  }}
                  errors={fields.password.errors}
                  className="mt-2 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <Field
                  labelProps={{ children: 'Confirm Password' }}
                  inputProps={{
                    ...conform.input(fields.confirmPassword),
                    type: "password",
                    autoFocus: true,
                  }}
                  errors={fields.confirmPassword.errors}
                  className="mt-2 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />                
                <CheckboxField
                  labelProps={{
                    htmlFor: fields.remember.id,
                    children: 'Remember me',
                  }}
                  buttonProps={conform.input(fields.remember, {
                    type: 'checkbox',
                  })}
                  errors={fields.remember.errors}
                />
                <ErrorList errors={form.errors} id={form.errorId} />
                <hr />
                <div className="flex items-center justify-between gap-6 pt-3">
                  <StatusButton
                    className="w-full text-white"
                    status={
                      signupFetcher.state === 'submitting'
                        ? 'pending'
                        : signupFetcher.data?.status ?? 'idle'
                    }
                    type="submit"
                    disabled={signupFetcher.state !== 'idle'}
                  >
                    Create Account
                  </StatusButton>
                </div>
              </signupFetcher.Form>  
              <div className="flex items-center justify-center gap-2 pt-6">
      					<span className="text-muted-foreground">Already have an account?</span>
					      <Link to="/signin">Sign in Now</Link>
				      </div>                
            </div>
          </div>
        </div>
      </Container>
    );
}