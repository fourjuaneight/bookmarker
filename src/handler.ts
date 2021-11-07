import { bookmarkPage } from './bookmark-page';
import { bookmarkPodcasts } from './bookmark-podcasts';
import { bookmarkReddits } from './bookmark-reddits';
import { bookmarkTweets } from './bookmark-tweets';
import { bookmarkVimeo } from './bookmark-vimeos';
import { bookmarkYouTube } from './bookmark-youtubes';
import { bookmarks, github, stackoverflow, media, manga } from './tags';

import { BookmarkingResponse, PageData, RequestPayload } from './typings.d';

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
const tagsList: { [key: string]: string[] } = {
  bookmarks,
  github,
  stackoverflow,
  media,
  manga,
};

const handleAction = async (payload: RequestPayload): Promise<Response> => {
  try {
    const data = payload.data as PageData;
    let response: BookmarkingResponse;
    let location: string = 'None';

    switch (true) {
      case payload.table === 'Tags': {
        return new Response(
          JSON.stringify({
            tags: tagsList[payload.tagList],
            location: payload.tagList,
          }),
          responseInit
        );
      }
      case payload.table === 'Podcasts':
        location = 'Podcasts';
        response = await bookmarkPodcasts(data.url, data.tags);
        break;
      case payload.table === 'Reddits':
        location = 'Reddits';
        response = await bookmarkReddits(data.url, data.tags);
        break;
      case payload.table === 'Tweets':
        location = 'Tweets';
        response = await bookmarkTweets(data.url, data.tags);
        break;
      case payload.table === 'Videos':
        location = 'Videos';
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
      case payload.table === 'Tags' && !payload.tagList:
        return new Response(
          JSON.stringify({ error: "Missing 'tagList' parameter." }),
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
      case payload.table !== 'Tags' && !payload.data?.url:
        return new Response(
          JSON.stringify({ error: "Missing 'url' parameter." }),
          badReqBody
        );
      case payload.table !== 'Tags' &&
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

  return new Response(null, {
    status: 415,
    statusText: 'Unsupported Media Type',
  });
};
