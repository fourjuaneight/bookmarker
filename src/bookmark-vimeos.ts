import { airtableUpload } from './airtable-upload.ts';

import {
  BookmarkData,
  BookmarkingResponse,
  VimeoResponse,
} from './typings.d.ts';

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
 * Get tweet details via Vimeo API.
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
    const response: VimeoResponse = await request.json();

    return {
      title: response.name,
      creator: response.user.name,
      url,
    };
  } catch (error) {
    throw new Error(`Getting vimeo details: \n ${error}`);
  }
};

/**
 * Get Vimeo video details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url video url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkVimeo = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const vimeoData = await getVimeoDetails(url);
    const airtableResp = await airtableUpload('Videos', {
      ...vimeoData,
      tags,
    });

    return { success: true, message: airtableResp, source: 'bookmarkVimeo' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkVimeo' };
  }
};
