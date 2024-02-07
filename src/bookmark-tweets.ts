import { addHasuraRecord } from './hasura';
import { emojiRange } from './fmt';

import { BookmarkingResponse, TwitterData, TwitterResponse } from './typings.d';

/**
 * Get the unicode code of an emoji in base 16.
 * @function
 *
 * @param {string} emojiString the string containing emoji characters
 * @returns {string} the unicode code
 */
const convertEmoji = (emojiString: string): string => {
  let comp: string | number;

  if (emojiString.length === 1) {
    comp = emojiString.charCodeAt(0);
  }

  comp =
    (emojiString.charCodeAt(0) - 0xd800) * 0x400 +
    (emojiString.charCodeAt(1) - 0xdc00) +
    0x10000;

  if (comp < 0) {
    comp = emojiString.charCodeAt(0);
  }

  // get the unicode code of an emoji in base 16
  comp = `U+${comp.toString(16)}`;

  return comp;
};

/**
 * Takes a string and replaces unicode
 * @function
 *
 * @param {string} tweet tweet string with emojies
 * @returns {string} tweet with unicode emojies
 */
const emojiUnicode = (tweet: string): string =>
  tweet.replace(emojiRange, (p1: string) => `${convertEmoji(p1)}`);

/**
 * Expand shortend URLs.
 * @function
 * @async
 *
 * @param {string} url shortned url string
 * @returns {Promise<string>} expanded URL
 */
const expandLinks = async (url: string): Promise<string> => {
  try {
    const request = await fetch(url);

    if (!request.url) {
      console.error({
        message: 'Expand Links: unable to expand URL.',
        status: request.status,
      });

      return url;
    }

    return request.url;
  } catch (error) {
    throw `(expandLinks): ${error}`;
  }
};

/**
 * Get expanded URLs.
 * @function
 * @async
 *
 * @param {string} str string to replace
 * @param {RegExp} regex pattern to match
 * @returns {Promise<string>} list of expanded URLs from str
 */
const expandShortLink = async (str: string, regex: RegExp): Promise<string> => {
  try {
    const promises: Promise<string>[] = [];
    const pattern = new RegExp(regex);

    // eslint-disable-next-line no-unused-vars
    str.replace(pattern, (match, ...args) => {
      const promise = expandLinks(match);
      promises.push(promise);

      return match;
    });

    const data = await Promise.all(promises);
    const replacer = () => data.shift() ?? '';

    return replacer ? str.replace(regex, replacer) : str;
  } catch (error) {
    throw `(expandShortLink): ${error}`;
  }
};

/**
 * Convert tweet url to API ready endpoint. Extracts tweet ID.
 * @function
 *
 * @param {string} url tweet url
 * @returns {string} API endpoint to fetch tweet data
 */
const cleanUrl = (url: string): string => {
  const updatedStr = url
    .replace(/(https:\/\/([a-z]+\.)?twitter\.com\/)/g, '')
    .replace(
      /.*\/status\/([0-9]+)(.*)?/g,
      'https://api.twitter.com/2/tweets/$1'
    );

  return updatedStr;
};

/**
 * Get tweet details via Twitter API.
 * Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference
 * @function
 * @async
 *
 * @param {string} url tweet url
 * @returns {Promise<TwitterData>} tweet text, poster, and url
 */
const getTweetDetails = async (url: string): Promise<TwitterData> => {
  try {
    const endpoint = cleanUrl(url);
    const request = await fetch(
      `${endpoint}?tweet.fields=created_at&user.fields=username&expansions=author_id`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (request.status !== 200) {
      throw `(getTweetDetails): ${request.status} - ${request.statusText}`;
    }

    const response: TwitterResponse = await request.json();
    const { username } = response.includes.users[0];
    const formattedText = emojiUnicode(response.data.text);
    const cleanText = await expandShortLink(
      formattedText,
      /(https:\/\/t.co\/[a-zA-z0-9]+)/g
    );
    const tweet = cleanText.replace(/[‘’]+/g, `'`).replace(/[“”]+/g, `"`);

    return {
      tweet,
      user: `@${username}`,
      url: `https://twitter.com/${username}/status/${response.data.id}`,
    };
  } catch (error) {
    throw `(getTweetDetails): ${error}`;
  }
};

/**
 * Get tweet details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url tweet url
 * @param {string[]} tags record tags
 * @param {string} endpoint Hasura endpoint
 * @param {string} secret Hasura secret
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkTweets = async (
  url: string,
  tags: string[],
  endpoint: string,
  secret: string
): Promise<BookmarkingResponse> => {
  try {
    const tweetData = await getTweetDetails(url);
    const hasuraResp = await addHasuraRecord(
      'tweets',
      {
        ...tweetData,
        tags,
        dead: false,
      },
      endpoint,
      secret
    );

    return { success: true, message: hasuraResp, source: 'bookmarkTweets' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkTweets' };
  }
};
