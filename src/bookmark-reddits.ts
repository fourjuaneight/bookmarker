import { addHasuraRecord } from './hasura';
import { fmtValue } from './fmt';

import { BookmarkingResponse, RedditData } from './typings.d';

/**
 * Get post details via Reddit API.
 * @function
 * @async
 *
 * @param {string} url post url
 * @returns {Promise<RedditData>} reddit title, content, subreddit, and url
 */
const getRedditDetails = async (url: string): Promise<RedditData> => {
  try {
    const request = await fetch(`${url}.json`);

    if (request.status !== 200) {
      throw `(getRedditDetails): ${request.status} - ${request.statusText}`;
    }

    const response = await request.json();
    const post = response[0].data.children[0].data;

    return {
      title: fmtValue(post.title),
      content:
        post.selftext ||
        post.media?.reddit_video?.fallback_url?.replace(
          '?source=fallback',
          ''
        ) ||
        post.url_overridden_by_dest,
      subreddit: post.subreddit_name_prefixed,
      url,
    };
  } catch (error) {
    throw `(getRedditDetails): \n ${error}`;
  }
};

/**
 * Get reddit details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url reddit post url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkReddits = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const redditData = await getRedditDetails(url);
    const hasuraResp = await addHasuraRecord('reddits', {
      ...redditData,
      tags,
      dead: false,
    });

    return { success: true, message: hasuraResp, source: 'bookmarkReddits' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkReddits' };
  }
};
