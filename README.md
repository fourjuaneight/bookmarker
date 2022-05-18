# Bookmarker

![worker](https://github.com/fourjuaneight/bookmarker/actions/workflows/worker.yml/badge.svg)<br/>

I like hoarding data online. This is how all that crap gets saved. It's a simple collection of scripts to parse, format, and upload bookmarks to a [Hasura](https://hasura.io/docs/latest/graphql/core/index/) database. This is then deployed to a [Cloudflare Workers](https://developers.cloudflare.com/workers/). But can quickly be tweaked to work with [Deno Deploy](https://deno.com/deploy/docs).

All code is self-documented. Aside from the specific names of bases and tables in Airtable, everything is easily portable and ready to fork. You'll just need to provide your environment variables.