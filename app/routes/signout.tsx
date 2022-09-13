import { redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { logout} from "~/auth.server";

export async function action({ request }: ActionArgs) {
  return logout(request);
}

export async function loader({request}: LoaderArgs) {
  //return redirect("/signin");
  return logout(request);
}