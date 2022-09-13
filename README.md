# Directed Stack

![The Directed Stack](/assets/directed-stack.png)

Learn more about [Remix Stacks](https://remix.run/stacks).

```
npx create-remix --template freekrai/directed-stack
```

## What's in the stack

- Healthcheck endpoint
- Email/Password Authentication with [cookie-based sessions](https://remix.run/docs/en/v1/api/remix#createcookiesessionstorage)
- [Directus](https://directus.io) handling auth, blog, pages, and backend storage
- Styling with [Tailwind](https://tailwindcss.com/)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-remix --template your/repo`! Make it your own.

## Quickstart

Click this button to create a [Gitpod](https://gitpod.io) workspace with the project set up, Postgres started, and Fly pre-installed

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/from-referrer/)

## Development

This repo contains two folders plus the root:

- `directus`: our Directus headless CMS
- `scripts`: our Directus schema
- `/`: our Remix app

## First run

On first one, clone this repo and run:

```bash
yarn
yarn setup
```

Then go into the directus folder and set up for local development by copying your `.env.example` into `.env` and filling out the fields.

Then run:

```bash
npx directus bootstrap
```

## Deploying

### Railway

You can deploy Directus to railway by clicking:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/_dszdt?referralCode=codedgeekery)

Once deploy, save `.env.example` to `.env`, and save the required info then run:

```bash
cd scripts
node schema.mjs
```

to create the necessary collections.

We also need to create a `users` user role, which has permissions to:

- notes
   - create: all access
   - view: where `created By` equals `$CURRENT_USER`
   - edit: where `created By` equals `$CURRENT_USER`
   - remove: where `created By` equals `$CURRENT_USER`
- users:
   - view: all access, Directus handles the proper rules
   - edit: where `ID` equals `$CURRENT_USER`

Take note of this role's ID as you'll need it when you deploy the remix app

Also edit the `public` role: 
   - directus_files
     - view: all access

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffreekrai%2Fdirected-stack&env=SESSION_SECRET,DIRECTUS_URL,DIRECTUS_STATIC_TOKEN,DIRECTUS_USER_ROLE)