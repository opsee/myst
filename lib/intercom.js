const config = require('config');
const Intercom = require('intercom-client');

const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key
});

module.exports = intercom;