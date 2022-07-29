import { bookmarkPage } from './bookmark-page';
import { bookmarkPodcasts } from './bookmark-podcasts';
import { bookmarkReddits } from './bookmark-reddits';
import { bookmarkTweets } from './bookmark-tweets';
import { bookmarkVimeo } from './bookmark-vimeos';
import { bookmarkYouTube } from './bookmark-youtubes';
import {
  queryBookmarkAggregateCount,
  queryBookmarkItems,
  queryTags,
  searchBookmarkItems,
} from './hasura';
import { version } from '../package.json';

import {
  BookmarkingResponse,
  CountColumn,
  RecordData,
  RequestPayload,
  Tables,
} from './typings.d';

// default responses
const responseInit = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
};
const badReqBody = {
  status: 400,
  statusText: 'Bad Request',
  ...responseInit,
};
const errReqBody = {
  status: 500,
  statusText: 'Internal Error',
  ...responseInit,
};
const noAuthReqBody = {
  status: 401,
  statusText: 'Unauthorized',
  ...responseInit,
};

/**
 * Helper method to determine which table/category to use.
 * @function
 * @async
 *
 * @param payload request payload
 * @returns {Promise<Response>} response
 */
const handleAction = async (payload: RequestPayload): Promise<Response> => {
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
        const tags = await queryTags(payload.table);

        return new Response(
          JSON.stringify({
            tags,
            location: payload.table,
            version,
          }),
          responseInit
        );
      }
      case payload.type === 'Query': {
        location = `${payload.type}-${fmtTable}`;

        const queryResults = await queryBookmarkItems(fmtTable);

        return new Response(
          JSON.stringify({
            bookmarks: queryResults,
            location,
            version,
          }),
          responseInit
        );
      }
      case payload.type === 'Search': {
        location = `${payload.type}-${fmtTable}`;

        const searchResults = await searchBookmarkItems(
          fmtTable,
          payload.query ?? '',
          payload.column ?? ''
        );

        return new Response(
          JSON.stringify({
            bookmarks: searchResults,
            location,
            version,
          }),
          responseInit
        );
      }
      case payload.type === 'Count': {
        location = `${payload.type}-${fmtTable}`;

        const queryResults = await queryBookmarkAggregateCount(
          fmtTable as Tables,
          payload.countColumn as CountColumn
        );

        return new Response(
          JSON.stringify({
            count: queryResults,
            location,
            version,
          }),
          responseInit
        );
      }
      case payload.table === 'podcasts':
        location = fmtTable;
        response = await bookmarkPodcasts(data.url, data.tags);
        break;
      case payload.table === 'reddits':
        location = fmtTable;
        response = await bookmarkReddits(data.url, data.tags);
        break;
      case payload.table === 'tweets':
        location = fmtTable;
        response = await bookmarkTweets(data.url, data.tags);
        break;
      case payload.table === 'videos':
        location = fmtTable;

        if (data.url.includes('vimeo')) {
          response = await bookmarkVimeo(data.url, data.tags);
        } else {
          response = await bookmarkYouTube(data.url, data.tags);
        }
        break;
      default: {
        location = 'Page';
        response = await bookmarkPage(payload.table, data as RecordData);
        break;
      }
    }

    if (!response.success) {
      return new Response(
        JSON.stringify({
          error: response.message,
          location: response.source,
          version,
        }),
        responseInit
      );
    }

    return new Response(
      JSON.stringify({
        bookmarked: response.message,
        location,
        version,
      }),
      responseInit
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ error, location, version }),
      errReqBody
    );
  }
};

/**
 * Handler method for all requests.
 * @function
 * @async
 *
 * @param {Request} request request object
 * @returns {Promise<Response>} response object
 */
export const handleRequest = async (request: Request): Promise<Response> => {
  // POST requests only
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ version }), {
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  // content-type check (required)
  if (!request.headers.has('content-type')) {
    return new Response(
      JSON.stringify({
        error: "Please provide 'content-type' header.",
        version,
      }),
      badReqBody
    );
  }

  const contentType = request.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const payload: RequestPayload = await request.json();
    const key = request.headers.get('key');

    // check for required fields
    switch (true) {
      case !payload.type:
        return new Response(
          JSON.stringify({ error: "Missing 'type' parameter.", version }),
          badReqBody
        );
      case payload.type !== 'Tags' && !payload.table:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter.", version }),
          badReqBody
        );
      case payload.type === 'Search' && !payload.query:
        return new Response(
          JSON.stringify({ error: "Missing 'query' parameter.", version }),
          badReqBody
        );
      case payload.type === 'Search' && !payload.column:
        return new Response(
          JSON.stringify({ error: "Missing 'column' parameter.", version }),
          badReqBody
        );
      case payload.type === 'Count' && !payload.countColumn:
        return new Response(
          JSON.stringify({
            error: "Missing 'countColumn' parameter.",
            version,
          }),
          badReqBody
        );
      case payload.type === 'Count' && !payload.table:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter.", version }),
          badReqBody
        );
      case payload.table === 'articles' && !payload.data?.title:
        return new Response(
          JSON.stringify({ error: "Missing 'data.title' parameter.", version }),
          badReqBody
        );
      case payload.table === 'comics' && !payload.data?.creator:
        return new Response(
          JSON.stringify({
            error: "Missing 'data.creator' parameter.",
            version,
          }),
          badReqBody
        );
      case payload.type === 'Insert' && !payload.data?.url:
        return new Response(
          JSON.stringify({ error: "Missing 'url' parameter.", version }),
          badReqBody
        );
      case payload.type === 'Insert' &&
        (payload.data?.tags.length === 0 || !Array.isArray(payload.data?.tags)):
        return new Response(
          JSON.stringify({ error: "Missing 'tags' parameter.", version }),
          badReqBody
        );
      case !key:
        return new Response(
          JSON.stringify({ error: "Missing 'key' header.", version }),
          noAuthReqBody
        );
      case key !== AUTH_KEY:
        return new Response(
          JSON.stringify({
            error: "You're not authorized to access this API.",
            version,
          }),
          noAuthReqBody
        );
      default: {
        return handleAction(payload);
      }
    }
  }

  // default to bad content-type
  return new Response(JSON.stringify({ version }), {
    status: 415,
    statusText: 'Unsupported Media Type',
  });
};
