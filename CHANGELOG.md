# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2022-06-15

### Bug Fixes

- Add branch name to commit saving step in action.

## [1.0.0] - 2022-06-15

### Bug Fixes

- Update typing names.
- Minor syntax corrections.
- Renmae Vimeo script correctly.
- Minor environment script syntax fixes.
- Add Wrangler action to build and deploy step.
- Add missing wrangler dependency.
- Add Wrangler action to publish script.
- Remove file extension from imports.
- Only check data params on bookmarking requests.
- Minor syntax corrections.
- Match full-length YouTube links and return error when nothing found.
- Move data check out of switch to prevent incorrect table lookup.
- Add default shell to Codespace config.
- Set correct shell profile for Codespace.
- Minor syntax correction.
- Minor syntax corrections.
- Add dynamic site matching to Stack Exchange endpoint.
- Encode apostrophes correctly.
- Replace character code with quotations.
- Add hq Reddit video url.
- Add optional chaining when extracting Reddit media.
- Minor naming corrections.
- Remove invalid input key.
- Add missing types.
- Restore missing wrangler config.
- Add secrets to worker action.
- Add missing Hasura type.
- Return mutated id on hasura add.
- Reference data from payload on handler.
- Add missing reference to payload.
- Update mutation to only insert one.
- Minor syntax corrections.
- Minor data checking optimizations.
- Further data checking optimizations.
- Make column param on search required.
- Minor typing corrections.
- Minor typing adjustments.
- Remove schema name from table name when checking for duplicates.
- Query archive instead of duplicate tags.
- Remove archive query from tweets table.
- Add missing page attributes.
- Minor typing optimizations.

### Features

- Add Airtable upload helper.
- Add podcasts bookmarking script.
- Add function listener.
- Add reddits bookmarking script.
- Add tweets bookmarking script.
- Add vimeo bookmarking script.
- Add youtubes bookmarking script.
- Add articles and comics bookmarking scripts.
- Add all bookmarking scripts, improved error handling, and basic auth to main request script.
- Update scripts to for Cloudflare Workers.
- Add script to move env variables to Wrangler config on build.
- Add Action to build and deploy on push.
- Add bookmark tags data file.
- Add tags data file.
- Add tags list response.
- Automatically detect source on podcast bookmarking.
- Add custom image for Codespace.
- Add remote user and dependency install command.
- Update Airtable upload method to accomodate StackExchange questions.
- Add StackExchange question saving endpoint.
- Add Gitpod config.
- Add util function to decode HTML character codes.
- Update Codespace image.
- Add Reddit video as media url.
- Add subreddit name to reddit data from API response.
- Replace odd characters.
- [**breaking**] Migrate data saving to Hasura.
- Use esbuild to compile worker and publish using action only.
- Forward requests if an exception is thrown during execution.
- Add query/search hasura methods for bookmarks table.
- [**breaking**] Add payload type and query/search for bookmarks.
- Add optional column param on search.
- Recieve auth key as header.
- Check if bookmark existing before adding.
- Add hasura tags query in place of static list.
- Return id and archive on queries and searches.

### Miscellaneous Tasks

- Add ignore file.
- Add typings for Podcast request.
- Minor syntax optimizations.
- Update ignore file to include directory changes.
- Move scripts to src directory.
- Add npm dependencies.
- Add formatting and linting configs.
- Add Docker setup.
- Add TypeScript config.
- Add Wrangler config.
- Update success response message.
- Add README.
- Add logging to YouTube bookmarking for debugging.
- Minor syntax optimizations.
- Add logs fir debugging.
- Add node dependencies for debugging.
- Remove logs and optimize syntax.
- Update podcasts bookmarker name cleanup.
- Add more podcasts title cleanup regex.
- Improve handler script comments.
- Add event type to request listener.
- Remove duplicate tag.
- Add Codespace container user.
- Add new tag.
- Add new tag.
- Cleanup StackOverflow tags.
- Add StackExchange typings.
- Add Airtable Development endpoint.
- Update Action with new env variable.
- Update tags list.
- Remove deprecated tags.
- Remove deprecated and redundant tags.
- Add new tag.
- Remove deprecated tags.
- Update tags.
- Add nee tags.
- Minor error handling optimizations.
- Bump minimist from 1.2.5 to 1.2.6
- Bump node-fetch from 2.6.6 to 2.6.7
- Update bookmarks tags.
- Allow throw literals for better API responses.
- Minor syntax cleanup.
- Add new bookmark tags.
- Add new bookmarks tag.
- Update bookmarks typings.
- Update bookmark tags.
- Update table schemas.
- Add git cliff config for auto-generating changelogs.
- Remove deprecated dependencies.
- Update Node to latest LTS version.
- [**breaking**] Replace wrangler config with worker action settings.
- Remove deprecated configs.
- Update workflow runner to latest Ubuntu LTS version.
- [**breaking**] Remove redundant build/install steps on workflow.
- Remove deprecated script.
- Update readme.
- Add logging on errors.
- Install dependencies on separate step for caching.
- Rename hasura script.
- Remove dead column on queries.
- Remove deprecated tags.
- Better query error logging.
- Logging optimizations.
- Move id column query to the end for better ux.
- Remove unnecessary console.
- Generate changelog only on releases.

<!-- generated by git-cliff -->
