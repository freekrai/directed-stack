# Scripts folder

Scripts are where we store various scripts we use to handle processing things, such as creating initial schema, etc.

## Files

- `schema.mjs`: the script that sets up our schemas, just run this and it will include the other schema files
- `schemas/blog.mjs`: our initial blog schema
- `schemas/store.mjs`: our initial store schema

## Config

In the root of our app, there is an `.env.example` file, copy this to `.env` and update the variables accordingly, this is used by our scripts.