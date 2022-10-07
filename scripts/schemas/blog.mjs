import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { build } from "new-directus-schema-builder-kit"

const STATUS_INTERFACE_CHOICES = [
  { text: "$t:published", value: "published" },
  { text: "$t:draft", value: "draft" },
  { text: "$t:archived", value: "archived" }
];

const STATUS_DISPLAY_CHOICES = [
  { background: "#00C897", value: "published" },
  { background: "#D3DAE4", value: "draft" },
  { background: "#F7971C", value: "archived" }
];

const model = build((builder) => {
  const authors = builder.collection("authors").accountability("all");
  authors.primary_key("id", "uuid").hidden().readonly();
  authors.date_created("created_at").hidden().readonly().width("half");
  authors.user_created("created_by").hidden().readonly().width("half");
  authors.date_updated("updated_at").hidden().readonly().width("half");
  authors.user_updated("updated_by").hidden().readonly().width("half");
  authors.image("avatar");
  authors.string("first_name", 60).notNullable().width("half").interface("input", { trim: true }).required();
  authors.string("last_name", 90).width("half").interface("input", { trim: true }).required();
  authors.string("email").interface("input", { trim: true }).required();
  authors.string("bio").interface("input-multiline", { trim: true }).required();
  authors.o2m("posts", { template: "{{title}}" });

  const categories = builder
    .collection("categories")
    .sort("order")
    .archive("status", "archived", "draft")
    .accountability("all");
  categories.primary_key("id", "uuid").hidden().readonly();
  categories.date_created("created_at").hidden().readonly().width("half");
  categories.user_created("created_by").hidden().readonly().width("half");
  categories.date_updated("updated_at").hidden().readonly().width("half");
  categories.user_updated("updated_by").hidden().readonly().width("half");
  categories.integer("order").hidden();
  categories
    .string("status")
    .default("published")
    .notNullable()
    .interface("select-dropdown", { choices: STATUS_INTERFACE_CHOICES })
    .display("labels", { showAsDot: true, choices: STATUS_DISPLAY_CHOICES });
  categories.string("name", 60).notNullable().interface("input", { trim: true }).required();
  categories.string("slug").interface("extension-wpslug", { template: "{{name}}", prefix: "/categories/" }).required();
//  categories.string("slug").notNullable().unique().interface("input", { trim: true, slug: true }).required();
  
  categories.image("image");
  categories.m2m("posts", { template: "{{post.title}}" });

  const posts = builder.collection("posts").archive("status", "archived", "draft").accountability("all");
  posts.primary_key("id", "uuid").hidden().readonly();
  posts.date_created("created_at").hidden().readonly().width("half");
  posts.user_created("created_by").hidden().readonly().width("half");
  posts.date_updated("updated_at").hidden().readonly().width("half");
  posts.user_updated("updated_by").hidden().readonly().width("half");
  posts
    .string("status")
    .default("published")
    .notNullable()
    .interface("select-dropdown", { choices: STATUS_INTERFACE_CHOICES })
    .display("labels", { showAsDot: true, choices: STATUS_DISPLAY_CHOICES });
  posts.image("image");
  posts.string("title", 90).notNullable().interface("input", { trim: true }).required();
  posts.string("slug").interface("extension-wpslug", { template: "{{title}}", prefix: "/blog/" }).required();
//  posts.string("slug").notNullable().unique().interface("input", { trim: true, slug: true }).required();
  posts.text("excerpt").notNullable().interface("input-multiline", { trim: true }).required();
  posts.text("body").notNullable().interface("input-rich-text-md");
  posts
    .foreign("author", "authors", "posts", {
      template: "{{first_name}} {{last_name}}",
      on_delete: "RESTRICT"
    })
    .notNullable();
  posts.m2m("categories", { template: "{{category.name}}" });

  const posts_categories = builder.collection("posts_categories").hidden().accountability("all");
  posts_categories.primary_key("id", "integer").hidden().readonly();

  posts_categories
    .foreign("post", "posts", "categories", {
      template: "{{post.title}}",
      junction_field: "category",
      one_deselect_action: "delete",
      on_delete: "CASCADE"
    })
    .notNullable();

  posts_categories
    .foreign("category", "categories", "posts", {
      template: "{{category.name}}",
      junction_field: "post",
      one_deselect_action: "delete",
      on_delete: "CASCADE"
    })
    .notNullable();
});

const baseURL = process.env.DIRECTUS_URL;
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;

export async function blogSchema() {
  model.fetch(baseURL, email, password).then(({ collections, relations }) => {
    console.log(JSON.stringify(collections, null, 2));
    console.log(JSON.stringify(relations, null, 2));
  });
}
