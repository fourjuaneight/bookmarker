import { airtableUpload } from './airtable-upload';

import {
  BookmarkingResponse,
  StackExchangeData,
  StackExchangeResponse,
} from './typings.d';

/**
 * Convert question url to API ready endpoint. Extracts question ID and site.
 * @function
 *
 * @param {string} url video url
 * @returns {string} API endpoint to fetch question data
 */
const cleanUrl = (url: string): string => {
  const updatedStr = url.replace(
    /https:\/\/([a-zA-Z0-9]+)\.com\/questions\/([0-9]+)\/.*/g,
    'https://api.stackexchange.com/2.3/questions/$2?order=desc&sort=activity&site=$1'
  );

  return updatedStr;
};

/**
 * Get question details via StckExchange API.
 * Docs: https://api.stackexchange.com/docs/questions-by-ids
 * @function
 * @async
 *
 * @param {string} url video url
 * @returns {Promise<StackExchangeData>} title, questionurl, and answer url
 */
const getQuestionDetails = async (url: string): Promise<StackExchangeData> => {
  try {
    const endpoint = cleanUrl(url);
    const site = url.replace(/https:\/\/([a-zA-Z0-9]+)\.com\/.*/g, '$1');
    const request = await fetch(endpoint);
    const response: StackExchangeResponse = await request.json();
    const decodeHtmlCharCodes = (str: string): string =>
      str.replace(/(&#(\d+);)/g, (match, capture, charCode) =>
        String.fromCharCode(charCode)
      );

    if (response.items.length === 0) {
      throw new Error('No question found');
    }

    return {
      title: decodeHtmlCharCodes(response.items[0].title).replace(
        /&quot;/g,
        '"'
      ),
      question: `https://${site}.com/q/${response.items[0].question_id}`,
      answer: response.items[0].is_answered
        ? `https://${site}.com/a/${response.items[0].accepted_answer_id}`
        : '',
    };
  } catch (error) {
    throw `Getting stackexchange details: \n ${error}`;
  }
};

/**
 * Get StackExchange question details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url question url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkStackExchange = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const questionData = await getQuestionDetails(url);
    const airtableResp = await airtableUpload(
      'StackExchange',
      {
        ...questionData,
        tags,
      },
      true
    );

    return {
      success: true,
      message: airtableResp,
      source: 'bookmarkStackExchange',
    };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkStackExchange' };
  }
};
