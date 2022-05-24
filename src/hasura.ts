import { HasuraErrors, HasuraMutationResp, RecordData } from './typings.d';

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
 * Upload record object to Hasura.
 * @function
 * @async
 *
 * @param {string} list table name
 * @param {RecordData} record data to upload
 * @returns {Promise<void>}
 */
export const addHasuraRecord = async (
  list: string,
  record: RecordData
): Promise<void> => {
  const query = `
    mutation {
      insert_${list}(objects: [{${objToQueryString(record)}}]) {
        returning {
          id
        }
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
    const response: HasuraMutationResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `Adding record to Hasura - ${list}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }
  } catch (error) {
    throw `Adding record to Hasura - ${list}: \n ${error}`;
  }
};
