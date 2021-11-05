import { airtableUpload } from './airtable-upload.ts';

import { BookmarkingResponse } from './typings.d.ts';

/**
 * Upload article|comic to Airtable.
 * @function
 * @async
 *
 * @param {string} table table name
 * @param {string} title page title
 * @param {string} creator page creator
 * @param {string} url page url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPage = async (
  table: string,
  title: string,
  creator: string,
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const airtableResp = await airtableUpload(table, {
      title,
      creator,
      url,
      tags,
    });

    return { success: true, message: airtableResp, source: 'bookmarkPage' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkPage' };
  }
};
