import {
  HasuraErrors,
  HasuraInsertResp,
  HasuraQueryResp,
  RecordData,
} from './typings.d';

const BK_FIELDS = {
  articles: ['title', 'author', 'site', 'url'],
  comics: ['title', 'creator', 'url'],
  podcasts: ['title', 'creator', 'url'],
  reddits: ['title', 'subreddit', 'url'],
  tweets: ['tweet', 'user', 'url'],
  videos: ['title', 'creator', 'url'],
};

const objToQueryString = (obj: { [key: string]: any }) =>
  Object.keys(obj).map(key => {
    const value = obj[key];
    const fmtValue =
      typeof value === 'string'
        ? `"${value
            .replace(/\\/g, '')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')}"`
        : Array.isArray(value)
        ? `"${value.join(',')}"`
        : value;

    return `${key}: ${fmtValue}`;
  });

/**
 * Get bookmark entries from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @returns {Promise<RecordData[]>}
 */
export const queryBookmarkItems = async (
  table: string
): Promise<RecordData[]> => {
  const query = `
    {
      bookmarks_${table}(order_by: {
        ${table === 'tweets' ? 'tweet' : 'title'}: asc
      }) {
        ${BK_FIELDS[table].join('\n')}
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraQueryResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      console.log('queryBookmarkItems', errors);
      throw `Querying records from Hasura - Bookmarks - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    console.log('queryBookmarkItems', response);

    return (response as HasuraQueryResp).data[`bookmarks_${table}`];
  } catch (error) {
    console.log('queryBookmarkItems', error);
    throw `Querying records from Hasura - Bookmarks - ${table}: \n ${error}`;
  }
};

/**
 * Search bookmark entries from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {string} pattern
 * @param {[string]} column
 * @returns {Promise<RecordData[]>}
 */
export const searchBookmarkItems = async (
  table: string,
  pattern: string,
  column: string
): Promise<RecordData[]> => {
  const query = `
    {
      bookmarks_${table}(
        order_by: {${column}: asc},
        where: {${column}: {_iregex: ".*${pattern}.*"}}
      ) {
        ${BK_FIELDS[table].join('\n')}
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraQueryResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      console.log('searchBookmarkItems', errors);
      throw `Searching records from Hasura - Bookmarks - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    console.log('searchBookmarkItems', response);

    return (response as HasuraQueryResp).data[`bookmarks_${table}`];
  } catch (error) {
    console.log('searchBookmarkItems', error);
    throw `Searching records from Hasura - Bookmarks - ${table}: \n ${error}`;
  }
};

/**
 * Upload record object to Hasura.
 * @function
 * @async
 *
 * @param {string} list table name
 * @param {RecordData} record data to upload
 * @returns {Promise<string>}
 */
export const addHasuraRecord = async (
  list: string,
  record: RecordData
): Promise<string> => {
  const isTweet = list === 'bookmarks_tweets';
  const bkColumn = isTweet ? 'tweet' : 'title';
  const bkTitle = isTweet ? record.tweet : record.title;
  const query = `
    mutation {
      insert_${list}_one(object: { ${objToQueryString(record)} }) {
        id
      }
    }
  `;

  try {
    const existing = await searchBookmarkItems(list, bkTitle ?? '', bkColumn);

    if (existing.length !== 0) {
      console.log('addHasuraRecord', 'Bookmark already exists.');

      throw 'Adding record to Hasura - Bookmark already exists.';
    }

    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraInsertResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      console.log('addHasuraRecord', errors);
      throw `Adding record to Hasura - ${list}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    console.log('addHasuraRecord', response);

    return (response as HasuraInsertResp).data[`insert_${list}_one`].id;
  } catch (error) {
    console.log('addHasuraRecord', error);
    throw `Adding record to Hasura - ${list}: \n ${error}`;
  }
};
