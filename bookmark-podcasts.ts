import { airtableUpload } from "./airtable-upload.ts";

import {
  BookmarkingResponse,
  ParsingPatterns,
  ParsingService,
  BookmarkData ,
} from "./typings.d.ts";

// list of regular expressions to find and replace
const parsing: ParsingPatterns = {
  castro: {
    title: new RegExp(/<h1>(.*)<\/h1>/, "g"),
    creator: new RegExp(/<h2><a\shref=".*"\salt=".*">(.*)<\/a><\/h2>/, "g"),
    url: new RegExp(/<source\ssrc="(.*)"\stype="audio\/mp3">/, "g"),
  },
  overcast: {
    title: new RegExp(
      /<h2\sclass="margintop0 marginbottom0"\sclass="title">(.*)<\/h2>/,
      "g"
    ),
    creator: new RegExp(/<a\shref="\/itunes\d+.*"\s?>(.*)<\/a>/, "g"),
    url: new RegExp(/<source\ssrc="(.*)"\stype="audio\/mp3"\s?\/>/, "g"),
  },
  title: [
    new RegExp(/^S\d+\s/, "g"),
    new RegExp(/^Ep\.\d{1,3}\s?/, "g"),
    new RegExp(/^([a-zA-Z\D\s]+)?#\d{1,3}:?\s/, "g"),
    new RegExp(/^Hasty Treat\s-\s/, "g"),
    new RegExp(/^(Bonus|BONUS):\s?/, "g"),
    new RegExp(/^Ep\.\s/, "g"),
    new RegExp(/\s—\sOvercast/, "g"),
    new RegExp(/\s-\sYouTube/, "g"),
    new RegExp(/\s+on Vimeo/, "g"),
    new RegExp(/\s-\sEp\.?\s\d+$/, "g"),
    new RegExp(/:\sArticles\sof\sInterest\s#\d+$/, "g"),
    new RegExp(/\s\D\s([0-9A-Za-z]+\s)+\D\s(Overcast)/, "g"),
    new RegExp(
      /(\D\d{1,3}\s\D\s)|(\d{1,3}\s\D\s)|(\w\d\D\w\d\s\D\s)|(\w+\s\d{1,3}\D\s)|(\d{1,3}\D\s)/,
      "g"
    ),
    new RegExp(/\s(—)(\s[A-Za-z]+)+/, "g"),
    new RegExp(/\s$/, "g"),
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
    return match[0].replace(pattern, "$1");
  }
  const error = "Param Cleaner: Unable to find match.";

  console.error(error);
  throw new Error(error);
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
    .replace(/(["':]+)/g, "\\$1")
    .replace(/([,]+)/g, "\\$1")
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

  patterns.forEach((regexp) => {
    cleanTitle = cleanTitle.replace(regexp, "");
  });

  return escapedString(cleanTitle);
};

/**
 * Get podcast details from HTML via RegEx.
 * @function
 * @async
 *
 * @param {string} url episode url
 * @param {string} source episode source; castro || overcast
 * @returns {Promise<BookmarkData >} episode title, podcast, and url
 */
const getPodcastDetails = async (
  url: string,
  source: string
): Promise<BookmarkData > => {
  const request = await fetch(url);

  try {
    const response = await request.text();
    // flatten doc; remove breakpoints and excessive spaces
    const post = response
      .replace(/\n\s+/g, "")
      .replace(/\n/g, "")
      .replace(/\s+/g, " ");
    // extract details from doc
    const service = parsing[source] as ParsingService;
    const title = paramCleaner(post, service.title);
    const creator = paramCleaner(post, service.creator);
    const link = paramCleaner(post, service.url).replace(
      /^(.*)\.(mp3).*/g,
      "$1.$2"
    );

    return {
      title: titleCleaner(title, parsing.title),
      creator,
      url: link,
    };
  } catch (error) {
    throw new Error(`Gettin podcast details: \n ${error}`);
  }
};

/**
 * Get podcast details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url podcast url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPodcasts = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const podcastData = await getPodcastDetails(url, "castro");
    const airtableResp = await airtableUpload("Podcasts", {
      ...podcastData,
      tags,
    });

    return { success: true, message: airtableResp, source: "bookmarkPodcasts" };
  } catch (error) {
    return { success: false, message: error, source: "bookmarkPodcasts" };
  }
};
