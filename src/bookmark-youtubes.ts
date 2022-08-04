import { addHasuraRecord } from './hasura';
import { fmtValue } from './fmt';

import {
  BookmarkData,
  BookmarkingResponse,
  YouTubeAPIEndpoint,
  YouTubeResponse,
} from './typings.d';

/**
 * Convert video url to API ready endpoint. Extracts youtube ID.
 * @function
 *
 * @param {string} url video url
 * @returns {YouTubeAPIEndpoint} API endpoint to fetch video data + bookmarking ready url
 */
const cleanUrl = (url: string): YouTubeAPIEndpoint => {
  const extractedID = url
    .replace(/(https:\/\/)(www\.)?(youtu.*)\.(be|com)\/(watch\?v=)?/g, '')
    .replace('&feature=share', '');
  const endpoint = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${extractedID}`;
  const link = `https://youtu.be/${extractedID}`;
  const data: YouTubeAPIEndpoint = { endpoint, link };

  return data;
};

/**
 * Get video details via YouTube API.
 * Docs: https://developers.google.com/youtube/v3/docs/videos/list
 * @function
 * @async
 *
 * @param {string} url video url
 * @returns {Promise<BookmarkData>} video title, creator, and url
 */
const getYouTubeDetails = async (url: string): Promise<BookmarkData> => {
  try {
    const { endpoint, link } = cleanUrl(url);
    const request = await fetch(`${endpoint}&key=${YOUTUBE_KEY}`);

    if (request.status !== 200) {
      throw `(getYouTubeDetails): ${request.status} - ${request.statusText}`;
    }

    const response: YouTubeResponse = await request.json();

    if (response.items.length === 0) {
      throw '(getYouTubeDetails): No video found';
    }

    const video = response.items[0].snippet;

    return {
      title: fmtValue(video.title),
      creator: fmtValue(video.channelTitle),
      url: link,
    };
  } catch (error) {
    throw `(getYouTubeDetails): \n ${error}`;
  }
};

/**
 * Get YouTube video details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url video url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkYouTube = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const youTubeData = await getYouTubeDetails(url);
    const hasuraResp = await addHasuraRecord('videos', {
      ...youTubeData,
      tags,
      dead: false,
    });

    return { success: true, message: hasuraResp, source: 'bookmarkYouTube' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkYouTube' };
  }
};
