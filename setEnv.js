const dotenv = require('dotenv');
const replace = require('replace-in-file');

const { resolve } = require('path');

dotenv.config();

const cwd = resolve(__dirname);

(async () => {
  const replaceOptions = {
    files: resolve(cwd, 'wrangler.toml'),
    from: [
      /account_id\s=\s""/g,
      /AUTH_KEY\s=\s""/g,
      /AIRTABLE_API\s=\s""/g,
      /AIRTABLE_BOOKMARKS_ENDPOINT\s=\s""/g,
      /AIRTABLE_DEVELOPMENT_ENDPOINT\s=\s""/g,
      /TWITTER_KEY\s=\s""/g,
      /VIMEO_KEY\s=\s""/g,
      /YOUTUBE_KEY\s=\s""/g,
    ],
    to: [
      `account_id = "${process.env.CF_ACCOUNT_ID}"`,
      `AUTH_KEY = "${process.env.AUTH_KEY}"`,
      `AIRTABLE_API = "${process.env.AIRTABLE_API}"`,
      `AIRTABLE_BOOKMARKS_ENDPOINT = "${process.env.AIRTABLE_BOOKMARKS_ENDPOINT}"`,
      `AIRTABLE_DEVELOPMENT_ENDPOINT = "${process.env.AIRTABLE_DEVELOPMENT_ENDPOINT}"`,
      `TWITTER_KEY = "${process.env.TWITTER_KEY}"`,
      `VIMEO_KEY = "${process.env.VIMEO_KEY}"`,
      `YOUTUBE_KEY = "${process.env.YOUTUBE_KEY}"`,
    ],
  };

  try {
    await replace(replaceOptions);
  } catch (error) {
    console.error('[setEnv]:', error);
  }
})();
