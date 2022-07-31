import {
  HasuraErrors,
  HasuraInsertResp,
  HasuraQueryAggregateResp,
  HasuraQueryResp,
  HasuraQueryTagsResp,
  CountColumn,
  RecordColumnAggregateCount,
  RecordData,
  Tables,
} from './typings.d';

interface KeyedRecordData {
  [key: string]: RecordData;
}

const BK_FIELDS = {
  articles: ['title', 'author', 'site', 'url', 'archive'],
  comics: ['title', 'creator', 'url', 'archive'],
  podcasts: ['title', 'creator', 'url', 'archive'],
  reddits: ['title', 'subreddit', 'url', 'archive'],
  tweets: ['tweet', 'user', 'url'],
  videos: ['title', 'creator', 'url', 'archive'],
};

const bkKey = (table: string, data: RecordData): string => {
  const options: { [key: string]: string } = {
    articles: `${data.title} - ${data.site}`,
    comics: `${data.title} - ${data.creator}`,
    podcasts: `${data.title} - ${data.creator}`,
    reddits: `${data.title} - ${data.subreddit}`,
    tweets: `${data.tweet}`,
    videos: `${data.title} - ${data.creator}`,
  };

  return options[table];
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
        ? `"{${value.join(',')}}"`
        : value;

    return `${key}: ${fmtValue}`;
  });

const countUnique = (iterable: string[]) =>
  iterable.reduce((acc: RecordColumnAggregateCount, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

const countUniqueSorted = (iterable: string[]) =>
  // sort descending by count
  Object.entries(countUnique(iterable))
    .sort((a, b) => b[1] - a[1])
    .reduce(
      (acc: RecordColumnAggregateCount, [key, val]) =>
        ({ ...acc, [key]: val } as RecordColumnAggregateCount),
      {}
    );

/**
 * Get bookmark tags from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @returns {Promise<RecordData[]>}
 */
export const queryTags = async (table: Tables): Promise<string[]> => {
  const query = `
    {
      meta_tags(
        order_by: {name: asc},
        where: {schema: {_eq: "bookmarks"}, table: {_eq: "${table}"}}
      ) {
        name
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
    const response: HasuraQueryTagsResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryTags) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    const tags = (response as HasuraQueryTagsResp).data.meta_tags.map(
      tag => tag.name
    );

    return tags;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get bookmark entries from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @returns {Promise<KeyedRecordData>}
 */
export const queryBookmarkItems = async (
  table: Tables
): Promise<KeyedRecordData> => {
  const column = table === 'tweets' ? 'tweet' : 'title';
  const query = `
    {
      bookmarks_${table}(order_by: {
        ${column}: asc
      }) {
        ${BK_FIELDS[table].join('\n')}
        id
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

      throw `(queryBookmarkItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    let keyedRecords: KeyedRecordData = {};
    const records = (response as HasuraQueryResp).data[`bookmarks_${table}`];

    if (records.length !== 0) {
      keyedRecords = records.reduce((acc: KeyedRecordData, item) => {
        acc[bkKey(table, item)] = item;

        return acc;
      }, {});
    }

    return keyedRecords;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get aggregated count of bookmark column from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @param {CountColumn} column
 * @returns {Promise<RecordColumnAggregateCount>}
 */
export const queryBookmarkAggregateCount = async (
  table: Tables,
  column: CountColumn
): Promise<RecordColumnAggregateCount> => {
  const sort = column === 'tags' ? 'title' : column;
  const query = `
    {
      bookmarks_${table}(order_by: {${sort}: asc}) {
        ${column}
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
    const response: any = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryBookmarkAggregateCount) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    const data = (response as HasuraQueryAggregateResp).data[
      `bookmarks_${table}`
    ];
    let collection: string[];

    if (column === 'tags') {
      collection = data.map(item => item[column] as string[]).flat();
    } else {
      collection = data.map(item => item[column] as string);
    }

    return countUniqueSorted(collection);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Search bookmark entries from Hasura.
 * @function
 * @async
 *
 * @param {Tables} table
 * @param {string} pattern
 * @param {[string]} column
 * @returns {Promise<KeyedRecordData>}
 */
export const searchBookmarkItems = async (
  table: Tables,
  pattern: string,
  column: string
): Promise<KeyedRecordData> => {
  const query = `
    {
      bookmarks_${table}(
        order_by: {${column}: asc},
        where: {${column}: {_iregex: ".*${pattern}.*"}}
      ) {
        ${BK_FIELDS[table].join('\n')}
        id
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

      throw `(searchBookmarkItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    let keyedRecords: KeyedRecordData = {};
    const records = (response as HasuraQueryResp).data[`bookmarks_${table}`];

    if (records.length !== 0) {
      keyedRecords = records.reduce((acc: KeyedRecordData, item) => {
        acc[bkKey(table, item)] = item;

        return acc;
      }, {});
    }

    return keyedRecords;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Upload record object to Hasura.
 * @function
 * @async
 *
 * @param {Tables} table table name
 * @param {RecordData} record data to upload
 * @returns {Promise<string>}
 */
export const addHasuraRecord = async (
  table: Tables,
  record: RecordData
): Promise<string> => {
  const isTweet = table === 'tweets';
  const bkColumn = isTweet ? 'tweet' : 'title';
  const bkTitle = isTweet ? record.tweet : record.title;
  const query = `
    mutation {
      insert_bookmarks_${table}_one(object: { ${objToQueryString(record)} }) {
        id
      }
    }
  `;

  try {
    const existing = await searchBookmarkItems(table, bkTitle ?? '', bkColumn);

    if (Object.keys(existing).length === 0) {
      throw '(addHasuraRecord): Bookmark already exists.';
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

      throw `(addHasuraRecord) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraInsertResp).data[`insert_bookmarks_${table}_one`]
      .id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
