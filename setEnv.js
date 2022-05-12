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
      /HASURA_ADMIN_SECRET\s=\s""/g,
      /HASURA_ENDPOINT\s=\s""/g,
      /TWITTER_KEY\s=\s""/g,
      /VIMEO_KEY\s=\s""/g,
      /YOUTUBE_KEY\s=\s""/g,
    ],
    to: [
      `account_id = "${process.env.CF_ACCOUNT_ID}"`,
      `AUTH_KEY = "${process.env.AUTH_KEY}"`,
      `HASURA_ADMIN_SECRET = "${process.env.HASURA_ADMIN_SECRET}"`,
      `HASURA_ENDPOINT = "${process.env.HASURA_ENDPOINT}"`,
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
