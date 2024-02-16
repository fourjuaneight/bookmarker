import { Context } from 'hono';

import { bookmarkPage } from './bookmark-page';
import { bookmarkPodcasts } from './bookmark-podcasts';
import { bookmarkReddits } from './bookmark-reddits';
import { bookmarkTweets } from './bookmark-tweets';
import { bookmarkVimeo } from './bookmark-vimeos';
import { bookmarkYouTube } from './bookmark-youtubes';
import {
  queryBookmarkAggregateCount,
  queryBookmarkItems,
  queryBookmarkItemsByTable,
  queryTags,
  searchBookmarkItems,
} from './hasura';
import { version } from '../package.json';

import {
  BookmarkingResponse,
  BookmarkResponse,
  CountColumn,
  RecordData,
  RequestPayload,
  Tables,
} from './typings.d';

/**
 * Helper method to determine which table/category to use.
 * @function
 * @async
 *
 * @param {Context} ctx Hono context
 * @param payload req payload
 * @returns {Promise<Response>} response
 */
const handleAction = async (
  ctx: Context,
  payload: RequestPayload
): Promise<Response> => {
  const { HASURA_ENDPOINT, HASURA_ADMIN_SECRET } = ctx.env;
  // payload data is present at time point
  const data: RecordData = payload.type === 'Insert' ? payload.data : {};
  const fmtTable = payload.table.toLowerCase();
  // default helps to determine if switch statement runs and correct table is used
  let location: string = 'None';
  let response: BookmarkingResponse;

  try {
    // determine which table and method to use
    switch (true) {
      case payload.type === 'Tags': {
        const tags = await queryTags(
          payload.table,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );

        ctx.status(200);
        return ctx.json<BookmarkResponse>({
          tags,
          location: payload.table,
          version,
        });
      }
      case payload.type === 'Query': {
        location = `${payload.type}-${fmtTable}`;

        const queryResults = await queryBookmarkItems(
          fmtTable,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );

        ctx.status(200);
        return ctx.json<BookmarkResponse>({
          results: queryResults,
          location,
          version,
        });
      }
      case payload.type === 'Search': {
        location = `${payload.type}-${fmtTable}`;

        const searchResults = await searchBookmarkItems(
          fmtTable,
          payload.query ?? '',
          payload.column ?? '',
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );

        ctx.status(200);
        return ctx.json<BookmarkResponse>({
          results: searchResults,
          location,
          version,
        });
      }
      case payload.type === 'Count': {
        location = `${payload.type}-${fmtTable}`;

        const queryResults = await queryBookmarkAggregateCount(
          fmtTable as Tables,
          payload.countColumn as CountColumn,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );

        ctx.status(200);
        return ctx.json<BookmarkResponse>({
          count: queryResults,
          location,
          version,
        });
      }
      case payload.table === 'podcasts':
        location = fmtTable;
        response = await bookmarkPodcasts(
          data.url,
          data.tags,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );
        break;
      case payload.table === 'reddits':
        location = fmtTable;
        response = await bookmarkReddits(
          data.url,
          data.tags,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );
        break;
      case payload.table === 'tweets':
        location = fmtTable;
        response = await bookmarkTweets(
          data.url,
          data.tags,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );
        break;
      case payload.table === 'videos':
        location = fmtTable;

        if (data.url.includes('vimeo')) {
          response = await bookmarkVimeo(
            data.url,
            data.tags,
            HASURA_ENDPOINT,
            HASURA_ADMIN_SECRET
          );
        } else {
          response = await bookmarkYouTube(
            data.url,
            data.tags,
            HASURA_ENDPOINT,
            HASURA_ADMIN_SECRET
          );
        }
        break;
      default: {
        location = 'Page';
        response = await bookmarkPage(
          payload.table,
          data as RecordData,
          HASURA_ENDPOINT,
          HASURA_ADMIN_SECRET
        );
        break;
      }
    }

    if (!response.success) {
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: response.message,
        location: response.source,
        version,
      });
    }

    ctx.status(200);
    return ctx.json<BookmarkResponse>({
      bookmarked: response.message,
      location,
      version,
    });
  } catch (error) {
    console.log('[handleAction]: ', error);
    ctx.status(500);
    return ctx.json<BookmarkResponse>({
      error,
      location,
      version,
    });
  }
};

/**
 * Handle GET requests.
 * @function
 * @async
 *
 * @param {Context} ctx Hono context
 * @returns {Promise<Response>} response object
 */
export const handleGet = async (ctx: Context): Promise<Response> => {
  const { HASURA_ENDPOINT, HASURA_ADMIN_SECRET } = ctx.env;
  const contentType = ctx.req.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const table = ctx.req.headers.get('table');

  // check for required fields
  switch (true) {
    case !contentType:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Please provide 'content-type' header.",
        version,
      });
    case !isJson:
      ctx.status(415);
      return ctx.json<BookmarkResponse>({
        error: 'Unsupported Media Type.',
        version,
      });
    case !table:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'table' header.",
        version,
      });
    default: {
      const queryItems = await queryBookmarkItemsByTable(
        table,
        HASURA_ENDPOINT,
        HASURA_ADMIN_SECRET
      );

      ctx.status(200);
      return ctx.json<BookmarkResponse>({
        bookmarks: queryItems,
        version,
      });
    }
  }
};

/**
 * Handle POST requests.
 * @function
 * @async
 *
 * @param {Context} ctx Hono context
 * @returns {Promise<Response>} response object
 */
export const handlePost = async (ctx: Context): Promise<Response> => {
  const { AUTH_KEY } = ctx.env;
  const contentType = ctx.req.headers.get('content-type');
  const key = ctx.req.headers.get('key');
  const isJson = contentType?.includes('application/json');
  const payload = await ctx.req.json<RequestPayload>();

  // check for required fields
  switch (true) {
    case !contentType:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Please provide 'content-type' header.",
        version,
      });
    case !isJson:
      ctx.status(415);
      return ctx.json<BookmarkResponse>({
        error: 'Unsupported Media Type.',
        version,
      });
    case !key:
      ctx.status(401);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'key' header.",
        version,
      });
    case key !== AUTH_KEY:
      ctx.status(401);
      return ctx.json<BookmarkResponse>({
        error: "You're not authorized to access this API.",
        version,
      });
    case !payload.type:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'type' parameter.",
        version,
      });
    case payload.type !== 'Tags' && !payload.table:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'table' parameter.",
        version,
      });
    case payload.type === 'Search' && !payload.query:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'query' parameter.",
        version,
      });
    case payload.type === 'Search' && !payload.column:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'column' parameter.",
        version,
      });
    case payload.type === 'Count' && !payload.countColumn:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'countColumn' parameter.",
        version,
      });
    case payload.type === 'Count' && !payload.table:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'table' parameter.",
        version,
      });
    case payload.type === 'Insert' &&
      payload.table === 'articles' &&
      !payload.data?.title:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'data.title' parameter.",
        version,
      });
    case payload.type === 'Insert' &&
      payload.table === 'comics' &&
      !payload.data?.creator:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'data.creator' parameter.",
        version,
      });
    case payload.type === 'Insert' && !payload.data?.url:
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'url' parameter.",
        version,
      });
    case payload.type === 'Insert' &&
      (payload.data?.tags.length === 0 || !Array.isArray(payload.data?.tags)):
      ctx.status(400);
      return ctx.json<BookmarkResponse>({
        error: "Missing 'tags' parameter.",
        version,
      });
    default: {
      return handleAction(ctx, payload);
    }
  }
};
