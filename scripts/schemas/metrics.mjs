import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import { build } from "new-directus-schema-builder-kit"

const model = build((builder) => {
    const metrics = builder.collection("metrics").sort("order").accountability("all")
    metrics.primary_key("id", "uuid").hidden().readonly()

    metrics.date_created("timestamp").hidden().readonly().width("half")
    metrics.string("service").notNullable().width("full").interface("select-dropdown", {
            choices: [
                { text: "Stripe", value: "stripe" },
                { text: "Social", value: "social" },
                { text: "GitHub", value: "github" },
                { text: "PayPal", value: "paypal" },
                { text: "Product", value: "product" },
                { text: "Discord", value: "discord" },
                { text: "YouTube", value: "youtube" },
            ]
        })
        .display("labels", {
            showAsDot: true,
            choices: [
                { foreground: '#FFFFFF', background: "#6772E5", value: "stripe" },
                { foreground: '#FFFFFF', background: "#1DA1F2", value: "social" },
                { foreground: '#FFFFFF', background: "#333333", value: "github" },
                { foreground: '#FFFFFF', background: "#00457C", value: "paypal" },
                { foreground: '#FFFFFF', background: "#5865F2", value: "discord" },
                { foreground: '#FFFFFF', background: "#FF0000", value: "discord" },
                { foreground: '#FFFFFF', background: "#FF0000", value: "discord" },
            ]
        });
    metrics.string("key").notNullable().interface("input", { trim: true }).required();
    metrics.string("value").notNullable().interface("input", { trim: true }).required();
});

const baseURL = process.env.DIRECTUS_URL;
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;

export async function metricsSchema() {
  model.fetch(baseURL, email, password).then(({ collections, relations }) => {
    console.log(JSON.stringify(collections, null, 2));
    console.log(JSON.stringify(relations, null, 2));
  });
}
