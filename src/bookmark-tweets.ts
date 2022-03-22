import { airtableUpload } from './airtable-upload';

import { BookmarkingResponse, TwitterData, TwitterResponse } from './typings.d';

// Match unicode and convert to emoji code
const emojiRange = new RegExp(
  /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}\u{200d}]/gu
);

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
    throw `Expanding shorten link: \n ${error}`;
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

    return str.replace(regex, replacer);
  } catch (error) {
    throw `Expanding all shorten link: \n ${error}`;
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
    const response: TwitterResponse = await request.json();
    const { username } = response.includes.users[0];
    const formattedText = emojiUnicode(response.data.text);
    const cleanText = await expandShortLink(
      formattedText,
      /(https:\/\/t.co\/[a-zA-z0-9]+)/g
    );

    return {
      tweet: cleanText,
      creator: `@${username}`,
      url: `https://twitter.com/${username}/status/${response.data.id}`,
    };
  } catch (error) {
    throw `Getting tweet details: \n ${error}`;
  }
};

/**
 * Get tweet details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url tweet url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkTweets = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const tweetData = await getTweetDetails(url);
    const airtableResp = await airtableUpload('Tweets', {
      ...tweetData,
      tags,
    });

    return { success: true, message: airtableResp, source: 'bookmarkTweets' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkTweets' };
  }
};
