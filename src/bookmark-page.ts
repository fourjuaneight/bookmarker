import { airtableUpload } from './airtable-upload';

import { BookmarkingResponse, PageData } from './typings.d';

/**
 * Upload article|comic to Airtable.
 * @function
 * @async
 *
 * @param {string} table airtable table name
 * @param {PageData} data page data
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPage = async (
  table: string,
  data: PageData
): Promise<BookmarkingResponse> => {
  try {
    const airtableResp = await airtableUpload(table, {
      title: data.title,
      creator: data.creator,
      url: data.url,
      tags: data.tags,
    });

    return { success: true, message: airtableResp, source: 'bookmarkPage' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkPage' };
  }
};
