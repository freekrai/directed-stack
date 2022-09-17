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
- Markdown rendering by [Markdoc](https://markdoc.dev)
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

## Markdown 

We use [Markdoc](https://markdoc.dev/) to render our markdown.

This lets us do syntax highlighting as well as adding other components, one example component is `callouts`

```markdown
{% callout title="You should know!" %}
This is what a note message looks like. You might want to include inline code in it. Or maybe you’ll want to include a link in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}

{% callout type="warning" title="Oh no! Something bad happened!" %}
This is what a disclaimer message looks like. You might want to include inline code in it. Or maybe you’ll want to include a link in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}


{% callout type="success" title="Oh no! Something good happened!" %}
This is what a success message looks like. You might want to include inline code in it. Or maybe you’ll want to include a link in it. I don’t think we should get too carried away with other scenarios like lists or tables — that would be silly.
{% /callout %}
```

## Deploying

### Railway

This app uses a [slugs](https://github.com/dimitrov-adrian/directus-extension-wpslug-interface) extension that you want pre-installed, you can use my [Directus Railway](https://github.com/freekrai/directus-railway) repo to get started on Railway, to deploy Directus to railway, click:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/_dszdt?referralCode=codedgeekery)

You can find more info on this repo [here](https://codedgeekery.com/blog/directus-railway).

### Fly.io

If you're prefer to install Directus on [Fly.io](http://fly.io), you can follow this [repo](https://github.com/freekrai/directus-fly) instead.

### Migrate Schema

Once deployed, save `.env.example` to `.env`, and save the required info then run the following to to create the necessary collections:

```bash
cd scripts
node schema.mjs
```

### Users & Permissions

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

As for images, one recommended approach is to create a folder inside files called `public` or `posts`, make note of the ID then go into roles & permissions, edit the `public` role, 

- directus_files
  - view: where `Folder` equals `ID` of folder you created
     - Then select just the ID field
  
This way, only images inside the `posts` or `public` folder is available publicly.

_If you don't want to deal with folders, then you can make all `directus_files` publically viewable, the choice is yours.

### Deploying the Remix app to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffreekrai%2Fdirected-stack&env=SESSION_SECRET,DIRECTUS_URL,DIRECTUS_STATIC_TOKEN,DIRECTUS_USER_ROLE)
