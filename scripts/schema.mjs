
import { blogSchema } from "./schemas/blog.mjs";
import { noteSchema } from "./schemas/note.mjs";
import { pageSchema } from './schemas/page.mjs';

;(async () => {
    console.log("importing blog schema....");
    await blogSchema();

    console.log("importing page schema....");
    await pageSchema();

    console.log("importing note schema....");
    await noteSchema();
})()