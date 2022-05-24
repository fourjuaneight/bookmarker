import { bookmarkPage } from './bookmark-page';
import { bookmarkPodcasts } from './bookmark-podcasts';
import { bookmarkReddits } from './bookmark-reddits';
import { bookmarkStackExchange } from './bookmark-stackexchange';
import { bookmarkTweets } from './bookmark-tweets';
import { bookmarkVimeo } from './bookmark-vimeos';
import { bookmarkYouTube } from './bookmark-youtubes';
import { bookmarks, github, stackexchange, media, manga } from './tags';
import { queryBookmarkItems, searchBookmarkItems } from './hasura';

import { BookmarkingResponse, PageData, RequestPayload } from './typings.d';

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
// match tags list to array of tags
const tagsList: { [key: string]: string[] } = {
  bookmarks,
  github,
  stackexchange,
  media,
  manga,
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
  const data: PageData = payload.type === 'Insert' ? payload.data : {};
  // default helps to determine if switch statement runs and correct table is used
  let location: string = 'None';
  let response: BookmarkingResponse;

  try {
    // determine which table and method to use
    switch (true) {
      case payload.type === 'Tags': {
        return new Response(
          JSON.stringify({
            tags: tagsList[payload.tagList as string],
            location: payload.tagList,
          }),
          responseInit
        );
      }
      case payload.type === 'Query': {
        location = `${payload.type}-${payload.table}`;

        const queryResults = await queryBookmarkItems(payload.table);

        return new Response(
          JSON.stringify({
            bookmarks: queryResults,
            location,
          }),
          responseInit
        );
      }
      case payload.type === 'Search': {
        location = `${payload.type}-${payload.table}`;

        const searchResults = await searchBookmarkItems(
          payload.table,
          payload.query ?? ''
        );

        return new Response(
          JSON.stringify({
            bookmarks: searchResults,
            location,
          }),
          responseInit
        );
      }
      case payload.table === 'Podcasts':
        location = payload.table;
        response = await bookmarkPodcasts(data.url, data.tags);
        break;
      case payload.table === 'Reddits':
        location = payload.table;
        response = await bookmarkReddits(data.url, data.tags);
        break;
      case payload.table === 'StackExchange':
        location = payload.table;
        response = await bookmarkStackExchange(data.url, data.tags);
        break;
      case payload.table === 'Tweets':
        location = payload.table;
        response = await bookmarkTweets(data.url, data.tags);
        break;
      case payload.table === 'Videos':
        location = payload.table;

        if (data.url.includes('vimeo')) {
          response = await bookmarkVimeo(data.url, data.tags);
        } else {
          response = await bookmarkYouTube(data.url, data.tags);
        }
        break;
      default: {
        location = 'Page';
        response = await bookmarkPage(payload.table, data as PageData);
        break;
      }
    }

    if (!response.success) {
      return new Response(
        JSON.stringify({ error: response.message, location: response.source }),
        responseInit
      );
    }

    return new Response(
      JSON.stringify({
        bookmarked: response.message,
        location,
      }),
      responseInit
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error, location }), errReqBody);
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
    return new Response(null, {
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  // content-type check (required)
  if (!request.headers.has('content-type')) {
    return new Response(
      JSON.stringify({ error: "Please provide 'content-type' header." }),
      badReqBody
    );
  }

  const contentType = request.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const payload: RequestPayload = await request.json();

    // check for required fields
    switch (true) {
      case !payload.type:
        return new Response(
          JSON.stringify({ error: "Missing 'type' parameter." }),
          badReqBody
        );
      case payload.type !== 'Tags' && !payload.table:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter." }),
          badReqBody
        );
      case payload.type === 'Tags' && !payload.tagList:
        return new Response(
          JSON.stringify({ error: "Missing 'tagList' parameter." }),
          badReqBody
        );
      case payload.type === 'Search' && !payload.query:
        return new Response(
          JSON.stringify({ error: "Missing 'query' parameter." }),
          badReqBody
        );
      case payload.table === 'Articles' && !payload.data?.title:
        return new Response(
          JSON.stringify({ error: "Missing 'data.title' parameter." }),
          badReqBody
        );
      case payload.table === 'Comics' && !payload.data?.creator:
        return new Response(
          JSON.stringify({ error: "Missing 'data.creator' parameter." }),
          badReqBody
        );
      case payload.type !== 'Tags' && !payload.data?.url:
        return new Response(
          JSON.stringify({ error: "Missing 'url' parameter." }),
          badReqBody
        );
      case payload.type !== 'Tags' &&
        (payload.data?.tags.length === 0 || !Array.isArray(payload.data?.tags)):
        return new Response(
          JSON.stringify({ error: "Missing 'tags' parameter." }),
          badReqBody
        );
      case !payload.key:
        return new Response(
          JSON.stringify({ error: "Missing 'key' parameter." }),
          noAuthReqBody
        );
      case payload.key !== AUTH_KEY:
        return new Response(
          JSON.stringify({
            error: "You're not authorized to access this API.",
          }),
          noAuthReqBody
        );
      default: {
        return handleAction(payload);
      }
    }
  }

  // default to bad content-type
  return new Response(null, {
    status: 415,
    statusText: 'Unsupported Media Type',
  });
};
