import { addHasuraRecord } from './hasura';
import { fmtValue } from './fmt';

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
    title: fmtValue(data.title),
    url: cleanURL,
    tags: data.tags,
    dead: false,
  };
  const record = isArticle
    ? ({
        ...baseData,
        author: fmtValue(data.author),
        site: fmtValue(data.site),
      } as RecordData)
    : ({ ...baseData, author: fmtValue(data.author) } as RecordData);

  try {
    const hasuraResp = await addHasuraRecord(table, record);

    return { success: true, message: hasuraResp, source };
  } catch (error) {
    return { success: false, message: error, source };
  }
};
