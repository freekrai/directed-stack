import type { ActionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { NoteEditor } from '~/routes/resources+/note-editor'

export default function NewNotePage() {
  return (
    <NoteEditor />
  );
}