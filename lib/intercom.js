const config = require('config');
const Intercom = require('intercom-client');

if (typeof config.intercom.app_api_key !== 'string') {
  throw new Error('Missing INTERCOM_API_KEY in env');
}

// For documentation, see https://github.com/intercom/intercom-node
const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key
}).usePromises();

module.exports = intercom;