import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { build } from "new-directus-schema-builder-kit"

const model = build((builder) => {
  const products = builder
    .collection("products")
    .sort("order")
    .archive("status", "archived", "draft")
    .accountability("all")
    .translation("es-ES", "Productos", "producto", "productos");

  products
    .primary_key("id", "uuid")
    .hidden()
    .readonly()
    .translation("es-ES", "ID");

  products
    .date_created("created_at")
    .hidden()
    .readonly()
    .width("half")
    .translation("es-ES", "Fecha de creación");

  products
    .user_created("created_by")
    .hidden()
    .readonly()
    .width("half")
    .translation("es-ES", "Creado por");

  products
    .date_updated("updated_at")
    .hidden()
    .readonly()
    .width("half")
    .translation("es-ES", "Fecha de actualización");

  products
    .user_updated("updated_by")
    .hidden()
    .readonly()
    .width("half")
    .translation("es-ES", "Actualizado por");

  products
    .integer("order")
    .hidden()
    .width("full")
    .translation("es-ES", "Orden");

  products
    .string("status")
    .default("draft")
    .notNullable()
    .width("full")
    .interface("select-dropdown", {
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
    })
    .translation("es-ES", "Estado");

  products
    .string("title")
    .notNullable()
    .width("full")
    .interface("input", { trim: true })
    .display("formatted-value", { bold: true })
    .required()
    .translation("es-ES", "Título");

  products
    .string("slug")
    .notNullable()
    .unique()
    .width("full")
    .interface("input", { trim: true, slug: true })
    .display("formatted-value", { prefix: "https://example.com/", color: "#00C897" })
    .required()
    .translation("es-ES", "Página");

  products
    .decimal("price")
    .notNullable()
    .width("full")
    .interface("input", { step: 0.01, min: 0 })
    .display("formatted-value", { format: true, suffix: " €" })
    .required()
    .translation("es-ES", "Precio");
});


const baseURL = process.env.DIRECTUS_URL;
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;

export async function storeSchema() {
  model.fetch(baseURL, email, password).then(({ collections, relations }) => {
    console.log(JSON.stringify(collections, null, 2));
    console.log(JSON.stringify(relations, null, 2));
  });
}