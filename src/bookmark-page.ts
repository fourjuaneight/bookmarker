import { addHasuraRecord } from './hasura';

import { BookmarkingResponse, PageData, RecordData, Tables } from './typings.d';

/**
 * Upload article|comic to Airtable.
 * @function
 * @async
 *
 * @param {Tables} table airtable table name
 * @param {PageData} data page data
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPage = async (
  table: Tables,
  data: PageData
): Promise<BookmarkingResponse> => {
  const isArticle = table === 'articles';
  const source = isArticle ? 'bookmarkPage:articles' : 'bookmarkPage:comics';
  const cleanURL = data.url
    .replace(/\?ref=.*/g, '')
    .replace(/\?utm_source/g, '');
  const baseData = {
    title: data.title,
    url: cleanURL,
    tags: data.tags,
    dead: false,
  };
  const record = isArticle
    ? ({ ...baseData, author: data.author, site: data.site } as RecordData)
    : ({ ...baseData, creator: data.creator } as RecordData);
  console.log('bookmarkPage', { record });

  try {
    const hasuraResp = await addHasuraRecord(table, record);

    return { success: true, message: hasuraResp, source };
  } catch (error) {
    return { success: false, message: error, source };
  }
};
