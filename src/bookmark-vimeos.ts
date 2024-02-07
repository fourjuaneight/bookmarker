import { addHasuraRecord } from './hasura';
import { fmtValue } from './fmt';

import { BookmarkData, BookmarkingResponse, VimeoResponse } from './typings.d';

/**
 * Convert video url to API ready endpoint. Extracts video ID.
 * @function
 *
 * @param {string} url video url
 * @returns {string} API endpoint to fetch video data
 */
const cleanUrl = (url: string): string => {
  const updatedStr = url.replace(
    /(https:\/\/vimeo\.com\/)(.*)/g,
    'https://api.vimeo.com/videos/$2'
  );

  return updatedStr;
};

/**
 * Get video details via Vimeo API.
 * Docs: https://developer.vimeo.com/api/reference/videos#get_video
 * @function
 * @async
 *
 * @param {string} url video url
 * @returns {Promise<BookmarkData>} video title, creator, and url
 */
const getVimeoDetails = async (url: string): Promise<BookmarkData> => {
  try {
    const endpoint = cleanUrl(url);
    const request = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${VIMEO_KEY}`,
      },
    });

    if (request.status !== 200) {
      throw `(getVimeoDetails): ${request.status} - ${request.statusText}`;
    }

    const response: VimeoResponse = await request.json();

    return {
      title: fmtValue(response.name),
      creator: fmtValue(response.user.name),
      url,
    };
  } catch (error) {
    throw `(getVimeoDetails): ${error}`;
  }
};

/**
 * Get Vimeo video details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url video url
 * @param {string[]} tags record tags
 * @param {string} endpoint Hasura endpoint
 * @param {string} secret Hasura secret
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkVimeo = async (
  url: string,
  tags: string[],
  endpoint: string,
  secret: string
): Promise<BookmarkingResponse> => {
  try {
    const vimeoData = await getVimeoDetails(url);
    const hasuraResp = await addHasuraRecord(
      'videos',
      {
        ...vimeoData,
        tags,
        dead: false,
      },
      endpoint,
      secret
    );

    return { success: true, message: hasuraResp, source: 'bookmarkVimeo' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkVimeo' };
  }
};
