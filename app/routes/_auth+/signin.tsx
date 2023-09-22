import type {
  DataFunctionArgs,
  MetaFunction,
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

import { passwordSchema, emailSchema } from '~/utils/user-validation'
import { checkboxSchema } from '~/utils/zod-extensions'
import { StatusButton } from '~/components/core/ui/status-button'
import { CheckboxField, ErrorList, Field } from '~/components/core/forms'

import Container from '~/components/layout/Container'
import { login, createUserSession } from '~/auth.server';

import getSeo from '~/seo';

const LoginFormSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	redirectTo: z.string().optional(),
	remember: checkboxSchema(),
})

export const meta: MetaFunction = ({ data, matches }) => {
	//let { meta } = data as SerializeFrom<typeof loader>;
  	//const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
        	title: 'Login',
        	//url: `${parentData[0].requestInfo.url}`,
        }),
	];
}

export async function action({ request }: DataFunctionArgs) {
    const formData = await request.formData();

    const submission = parse(formData, {
      schema: LoginFormSchema,
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
      redirectTo,
      remember,
    } = submission.value

    try {
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

    const signinFetcher = useFetcher<typeof action>()
    const [form, fields] = useForm({
      id: 'sigin-form',
      constraint: getFieldsetConstraint(LoginFormSchema),
      lastSubmission: signinFetcher.data?.submission,
      onValidate({ formData }) {
        return parse(formData, { schema: LoginFormSchema })
      },
      defaultValue: {
        redirectTo,
      },
      shouldRevalidate: 'onBlur',
    })
    
    return (
      <Container>
        <div className="min-h-full w-full flex flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          </div>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-indigo-100 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <signinFetcher.Form
                method="post"
                action="/signin"
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
                      signinFetcher.state === 'submitting'
                        ? 'pending'
                        : signinFetcher.data?.status ?? 'idle'
                    }
                    type="submit"
                    disabled={signinFetcher.state !== 'idle'}
                  >
                    Log in
                  </StatusButton>
                </div>
              </signinFetcher.Form>  
              <div className="flex items-center justify-center gap-2 pt-6">
      					<span className="text-muted-foreground">New here?</span>
					      <Link to="/signup">Create an account</Link>
				      </div>                
            </div>
          </div>
        </div>
      </Container>
    );
}