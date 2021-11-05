import { bookmarkPage } from './bookmark-page.ts';
import { bookmarkPodcasts } from './bookmark-podcasts.ts';
import { bookmarkReddits } from './bookmark-reddits.ts';
import { bookmarkTweets } from './bookmark-tweets.ts';
import { bookmarkVimeo } from './bookmark-vimeos.ts';
import { bookmarkYouTube } from './bookmark-youtubes.ts';

import { BookmarkingResponse, RequestPayload } from './typings.d.ts';

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

const handleAction = async (payload: RequestPayload): Promise<Response> => {
  try {
    let response: BookmarkingResponse;

    switch (true) {
      case payload.table === 'Podcasts': {
        response = await bookmarkPodcasts(payload.url, payload.tags);
        break;
      }
      case payload.table === 'Reddits': {
        response = await bookmarkReddits(payload.url, payload.tags);
        break;
      }
      case payload.table === 'Tweets': {
        response = await bookmarkTweets(payload.url, payload.tags);
        break;
      }
      case payload.table === 'Videos': {
        if (payload.url.includes('vimeo')) {
          response = await bookmarkVimeo(payload.url, payload.tags);
        } else {
          response = await bookmarkYouTube(payload.url, payload.tags);
        }
        break;
      }
      default: {
        response = await bookmarkPage(
          payload.table,
          payload.data?.title ?? '',
          payload.data?.creator ?? '',
          payload.url,
          payload.tags
        );
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
      JSON.stringify({ message: response.message, location: payload.table }),
      responseInit
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error, location: payload.table }),
      errReqBody
    );
  }
};

export const handleRequest = async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') {
    return new Response(null, {
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  if (!request.headers.has('content-type')) {
    return new Response(
      JSON.stringify({ error: "Please provide 'content-type' header." }),
      badReqBody
    );
  }

  const contentType = request.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    const payload: RequestPayload = await request.json();

    switch (true) {
      case !payload.table:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter." }),
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
      case !payload.url:
        return new Response(
          JSON.stringify({ error: "Missing 'url' parameter." }),
          badReqBody
        );
      case payload.tags.length === 0 || !Array.isArray(payload.tags):
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

  return new Response(null, {
    status: 415,
    statusText: 'Unsupported Media Type',
  });
};
