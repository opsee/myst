const config = require('config');
const Intercom = require('intercom-client');

// For documentation, see https://github.com/intercom/intercom-node
const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key
}).usePromises();

module.exports = intercom;