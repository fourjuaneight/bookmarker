import { addHasuraRecord } from './hasura';
import { fmtValue } from './fmt';

import {
  BookmarkingResponse,
  ParsingPatterns,
  ParsingService,
  BookmarkData,
} from './typings.d';

// list of regular expressions to find and replace
const parsing: ParsingPatterns = {
  castro: {
    title: new RegExp(/<h1>(.*)<\/h1>/, 'g'),
    creator: new RegExp(/<h2><a\shref=".*"\salt=".*">(.*)<\/a><\/h2>/, 'g'),
    url: new RegExp(/<source\ssrc="(.*)"\stype="audio\/mp3">/, 'g'),
  },
  overcast: {
    title: new RegExp(
      /<h2\sclass="margintop0 marginbottom0"\sclass="title">(.*)<\/h2>/,
      'g'
    ),
    creator: new RegExp(/<a\shref="\/itunes\d+.*"\s?>(.*)<\/a>/, 'g'),
    url: new RegExp(/<source\ssrc="(.*)"\stype="audio\/mp3"\s?\/>/, 'g'),
  },
  title: [
    new RegExp(/^S\d+\s/, 'g'),
    new RegExp(/^Ep\.\d{1,3}\s?/, 'g'),
    new RegExp(/^([a-zA-Z\D\s]+)?#\d{1,3}:?\s/, 'g'),
    new RegExp(/^Hasty Treat\s-\s/, 'g'),
    new RegExp(/^(Bonus|BONUS):\s?/, 'g'),
    new RegExp(/^Ep\.\s/, 'g'),
    new RegExp(/\s—\sOvercast/, 'g'),
    new RegExp(/\s-\sYouTube/, 'g'),
    new RegExp(/\s+on Vimeo/, 'g'),
    new RegExp(/The\sAdventure\sZone:/, 'g'),
    new RegExp(/\s-\sEp\.?\s\d+$/, 'g'),
    new RegExp(/:\sArticles\sof\sInterest\s#\d+$/, 'g'),
    new RegExp(/\s\D\s([0-9A-Za-z]+\s)+\D\s(Overcast)/, 'g'),
    new RegExp(
      /(\D\d{1,3}\s\D\s)|(\d{1,3}\s\D\s)|(\w\d\D\w\d\s\D\s)|(\w+\s\d{1,3}\D\s)|(\d{1,3}\D\s)/,
      'g'
    ),
    new RegExp(/\s(—)(\s[A-Za-z]+)+/, 'g'),
    new RegExp(/\s$/, 'g'),
    new RegExp(/^\s/, 'g'),
  ],
};

/**
 * Extract parameter from data source.
 * @function
 *
 * @param {string} data raw data source
 * @param {RegExp} pattern regular expression to replace for
 * @returns {string} extracted string
 */
const paramCleaner = (data: string, pattern: RegExp): string => {
  const match = data.match(pattern);

  if (match && match?.length > 0) {
    return match[0].replace(pattern, '$1');
  }

  throw '(paramCleaner): Unable to find match.';
};

/**
 * Escape characters in string for fetch request transport.
 * @function
 *
 * @param {string} str text to escape
 * @returns {string} request ready text
 */
const escapedString = (str: string): string =>
  str
    .replace(/(["':]+)/g, '\\$1')
    .replace(/([,]+)/g, '\\$1')
    .replace(/"/g, '"');

/**
 * Clean title based on list of patterns.
 * @function
 *
 * @param {string} string data source
 * @param {RegExp[]} patterns list of regular expressions to replace for
 * @returns {string} cleaned string
 */
const titleCleaner = (string: string, patterns: RegExp[]): string => {
  let cleanTitle = string;

  patterns.forEach(regexp => {
    cleanTitle = cleanTitle.replace(regexp, '');
  });

  return escapedString(cleanTitle);
};

/**
 * Get podcast details from HTML via RegEx.
 * @function
 * @async
 *
 * @param {string} url episode url
 * @returns {Promise<BookmarkData >} episode title, podcast, and url
 */
const getPodcastDetails = async (url: string): Promise<BookmarkData> => {
  try {
    const source = url.includes('castro') ? 'castro' : 'overcast';
    const request = await fetch(url);

    if (request.status !== 200) {
      throw `(getPodcastDetails): ${request.status} - ${request.statusText}`;
    }

    const response = await request.text();
    // flatten doc; remove breakpoints and excessive spaces
    const post = response
      .replace(/\n\s+/g, '')
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ');
    // extract details from doc
    const service = parsing[source] as ParsingService;
    const clnTitle = paramCleaner(post, service.title);
    const clnrTitle = titleCleaner(clnTitle, parsing.title);
    const fmtTitle = fmtValue(clnrTitle);
    const creator = paramCleaner(post, service.creator);
    const link = paramCleaner(post, service.url).replace(
      /^(.*)\.(mp3).*/g,
      '$1.$2'
    );

    return {
      title: fmtTitle,
      creator: fmtValue(creator),
      url: link,
    };
  } catch (error) {
    throw `(getPodcastDetails): ${error}`;
  }
};

/**
 * Get podcast details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url podcast url
 * @param {string[]} tags record tags
 * @param {string} endpoint Hasura endpoint
 * @param {string} secret Hasura secret
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPodcasts = async (
  url: string,
  tags: string[],
  endpoint: string,
  secret: string
): Promise<BookmarkingResponse> => {
  try {
    const podcastData = await getPodcastDetails(url);
    const hasuraResp = await addHasuraRecord(
      'podcasts',
      {
        ...podcastData,
        tags,
        dead: false,
      },
      endpoint,
      secret
    );

    return { success: true, message: hasuraResp, source: 'bookmarkPodcasts' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkPodcasts' };
  }
};
