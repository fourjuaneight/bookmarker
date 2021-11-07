import { AirtableError, AirtableResp, RecordData } from './typings.d';

/**
 * Upload podcast record object to Airtable
 * @function
 * @async
 *
 * @param {string} table Airtable table name
 * @param {RecordData} record formatted podcast record to upload
 * @returns {void}
 */
export const airtableUpload = async (
  table: string,
  record: RecordData
): Promise<string> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [
        {
          fields: record,
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${AIRTABLE_BOOKMARKS_ENDPOINT}/${table}`,
      options
    );
    const results: AirtableResp | AirtableError = await response.json();

    if ((results as AirtableError).errors) {
      throw new Error(
        `Uploading repos to Airtable: \n ${
          (results as AirtableError).errors[0].message
        }`
      );
    }

    const recordFields = (results as AirtableResp).records[0].fields;

    return (
      (recordFields.title || recordFields.tweet || recordFields.content) ?? ''
    );
  } catch (error) {
    throw new Error(`Uploading repos to Airtable: \n ${error}`);
  }
};
