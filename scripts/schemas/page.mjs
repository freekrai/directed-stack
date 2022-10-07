import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { build } from "new-directus-schema-builder-kit"

const model = build((builder) => {
    const pages = builder.collection("pages").sort("order").archive("status", "archived", "draft").accountability("all")
    pages.primary_key("id", "uuid").hidden().readonly()
    pages.date_created("created_at").hidden().readonly().width("half")
    pages.user_created("created_by").hidden().readonly().width("half")
    pages.date_updated("updated_at").hidden().readonly().width("half")
    pages.user_updated("updated_by").hidden().readonly().width("half")
    pages.integer("order").hidden().width("full")    
    pages.string("status").default("draft").notNullable().width("full").interface("select-dropdown", {
            choices: [
                { text: "$t:published", value: "published" },
                { text: "$t:draft", value: "draft" },
                { text: "$t:archived", value: "archived" }
            ]
        })
        .display("labels", {
            showAsDot: true,
            choices: [
                { background: "#00C897", value: "published" },
                { background: "#D3DAE4", value: "draft" },
                { background: "#F7971C", value: "archived" }
            ]
        });
    pages.string("title").notNullable().width("full").interface("input", { trim: true }).display("formatted-value", { bold: true }).required();
    pages.text("body").notNullable().interface("input-rich-text-md")
    pages.string("slug").interface("extension-wpslug", { template: "{{title}}", prefix: "/" }).required();
    //  pages.string("slug").notNullable().unique().interface("input", { trim: true, slug: true }).required();
});

const baseURL = process.env.DIRECTUS_URL;
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;

export async function pageSchema() {
  model.fetch(baseURL, email, password).then(({ collections, relations }) => {
    console.log(JSON.stringify(collections, null, 2));
    console.log(JSON.stringify(relations, null, 2));
  });
}
