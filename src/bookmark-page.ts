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
      author: data.author,
      site: data.site,
      url: data.url,
      tags: data.tags,
      status: 'alive',
    });

    return { success: true, message: airtableResp, source: 'bookmarkPage' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkPage' };
  }
};
