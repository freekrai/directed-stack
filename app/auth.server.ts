/*
this is the auth server, we use a different directus instance here.
*/

import { createCookieSessionStorage, redirect } from "@vercel/remix";

import { createDirectus } from '@directus/sdk';
import { authentication } from '@directus/sdk/auth';
import { 
  rest, 
  readMe, 
  updateMe,
  readItem,
  readItems,
  createItem,
  updateItem,
  aggregate,
  readSingleton,
  deleteItem,
} from '@directus/sdk/rest';

import { envSchema } from "~/env.server";

export type DirectusQuery = {
  fields: string[];
  filter?: any | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  search?: string | undefined;
  page?: number | undefined;
  meta?: any | undefined;
  sort?: string | undefined;
}

let env = envSchema.parse(process.env);

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export type User = {
  user: {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    name: string;
    createdAt: string;
    updatedAt: string;
    meta?: object;
    stripeCustomerId: string;
    notes: string;
    type: string;
  },
  token?: string;
}

//const directus = createDirectus(env.DIRECTUS_URL).with( authentication() ).with( rest() );

export const directus = createDirectus(env.DIRECTUS_URL) 
  .with(rest())
  .with(authentication('cookie', {
    msRefreshBeforeExpires: 900000,
    autoRefresh: true,
  }))

export async function getDirectusClient({
  email,
  password,
  token
}: {
  email?: string;
  password?: string;
  token?: string;
}) {
  if (email && password) {
    await directus.login(email, password);
  } else if (token) {
    await directus.setToken(token);
  }
  return directus;
}

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function createUserSession({
  request,
  userId,
  user,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  user: {
    access_token: string;
    refresh_token?: string;
    expires?: number;
  },
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  session.set("user", user);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

/*
export async function refreshToken (request ) {
  const session = await getSession(request); 
  const userId = session.get(USER_SESSION_KEY);
  const user = session.get('user');
}
*/

export async function login({
  email, 
  password, 
}: {
  email: string;
  password: string;
}) {
  const user = await directus.login(email, password);
  return user
}

export async function logout(request: Request) {
  //await directus.auth.logout();
  const session = await getSession(request);
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

const getToken = async (request: Request) => {
  const session = await getSession(request);
  return session.get(USER_SESSION_KEY);
};

export async function getUser(request: Request) {
  const token = await getToken(request);
  if (token === undefined) return null;
  const user = await getUserByToken(token);
  if (user) return user;
  throw await logout(request);
}

const getUserByToken = async (token: string) => {
  try {
    await directus.setToken(token);
    const user = await directus.request(
      readMe({
        fields: ['*'],
      })
    );
    if (!user.email) return false;
    return user;
  } catch(e) {
    return false;
  }
};

export async function requireAdminUser(request: Request) {
  const data = await isAuthenticated(request);
  if( data && data?.user ) {
    if( !data.user.tags.includes('internal') ) {
      throw redirect('/signout')
    }
    return data?.user;
  }
  throw redirect('/signout')
}

export async function requireUser(request: Request ){
  const data = await isAuthenticated(request);
  if( data && data?.user ) {
    return data?.user;
  }
  throw redirect('/signin')
}

export const isAuthenticated = async (request: Request, validateAndReturnUser = false) => {
  try {    
    const token = await getToken(request);
    if(!token) return false;
    await directus.setToken(token);
    const user = await directus.request(
      readMe({
        fields: ['*'],
      })
    );
    if (!user.email) return false;
    return {user, token};
  } catch(e) {
    return false;
  }
};

export async function getItemsCount(collection: string) {
	const result = await directus.request(
		aggregate(collection, {
			aggregate: { count: '*' },
			//groupBy: 'id',
		})
	);
	return result[0].count as unknown as number;
}

export async function getSingleton(collection: string, query?: DirectusQuery) {
	return directus.request( readSingleton(collection, query || {}) );
}

export async function getItemsByQuery(collection: string, query: DirectusQuery) {
	return directus.request( readItems(collection, query) );
}

export async function getItemBySlug(collection: string, slug: string, status='any') {
	let filter: any = {}

	// otherwise if "any" then any status...
	if( status === 'any' ) {
		filter = {
			slug: {
				_eq: slug,
			},
		}
	} else {
		filter = {
			"_and": [
				{
					status: {
						'_eq': status
					},
				},
				{
					slug: {
						_eq: slug,
					},
				}
			]
		}
	}
	const results = await getItemsByQuery(collection, {
		filter: filter,
		limit: 1,
		fields: ["*.*"],
	});
	// we return a single result here...
    return results[0];
}

export async function getItemById(collection: string, id: string) {
	return directus.request( readItem(collection, id) );
}


// export to include as needed...
export {
  readMe, 
  updateMe,
  readItem,
  readItems,
  readSingleton,
  aggregate,
  createItem,
  updateItem,
  deleteItem,
}
