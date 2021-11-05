import { listenAndServe } from "https://deno.land/std@0.111.0/http/server.ts";

import { bookmarkPodcasts } from "./bookmark-podcasts.ts";

import { BookmarkingResponse, RequestPayload } from "./typings.d.ts";

const responseInit = {
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
};
const badReqBody = {
  status: 400,
  statusText: "Bad Request",
  ...responseInit,
};
const errReqBody = {
  status: 500,
  statusText: "Internal Error",
  ...responseInit,
};

const handleAction = async (payload: RequestPayload): Promise<Response> => {
  try {
    const response: BookmarkingResponse = await bookmarkPodcasts(
      payload.url,
      payload.tags
    );

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

const handleRequest = async (request: Request) => {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  if (!request.headers.has("content-type")) {
    return new Response(
      JSON.stringify({ error: "Please provide 'content-type' header." }),
      badReqBody
    );
  }

  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload: RequestPayload = await request.json();

    switch (true) {
      case payload.table === undefined:
        return new Response(
          JSON.stringify({ error: "Missing 'table' parameter." }),
          badReqBody
        );
      case payload.url === undefined:
        return new Response(
          JSON.stringify({ error: "Missing 'url' parameter." }),
          badReqBody
        );
      case payload.tags === undefined:
        return new Response(
          JSON.stringify({ error: "Missing 'tags' parameter." }),
          badReqBody
        );
      default: {
        return handleAction(payload);
      }
    }
  }

  return new Response(null, {
    status: 415,
    statusText: "Unsupported Media Type",
  });
};

await listenAndServe(":8080", handleRequest);
