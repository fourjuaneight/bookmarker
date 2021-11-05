import "https://deno.land/x/dotenv@v3.1.0/load.ts";

import { AirtableError, AirtableResp, RecordData } from "./typings.d.ts";

/**
 * Upload podcast record object to Airtable
 * @function
 * @async
 *
 * @param {string} table Airtable table name
 * @param {RecordData} record formatted podcast record to upload
 * @return {void}
 */
export const airtableUpload = async (
  table: string,
  record: RecordData
): Promise<string> => {
  const options: RequestInit = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("AIRTABLE_API")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            ...record,
          },
        },
      ],
    }),
  };

  try {
    const response: Response = await fetch(
      `${Deno.env.get("AIRTABLE_BOOKMARKS_ENDPOINT")}/${table}`,
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

    return (results as AirtableResp).records[0].fields.title;
  } catch (error) {
    throw new Error(`Uploading repos to Airtable: \n ${error}`);
  }
};
