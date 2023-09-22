import type { DataFunctionArgs, } from "@vercel/remix";

import { logout} from "~/auth.server";

export async function action({ request }: DataFunctionArgs) {
  return logout(request);
}

export async function loader({request}: DataFunctionArgs) {
  return logout(request);
}