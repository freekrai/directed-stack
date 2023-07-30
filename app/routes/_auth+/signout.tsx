import type { ActionArgs, LoaderArgs } from "@vercel/remix";

import { logout} from "~/auth.server";

export async function action({ request }: ActionArgs) {
  return logout(request);
}

export async function loader({request}: LoaderArgs) {
  return logout(request);
}