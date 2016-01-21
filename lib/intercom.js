const config = require('config');
const Intercom = require('intercom-client');
const logger = require('../utils/logger');

logger.info('config', config.intercom);
logger.info('intercom api key', process.env.INTERCOM_API_KEY);


// For documentation, see https://github.com/intercom/intercom-node
const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key || 'somefakekey'
}).usePromises();

module.exports = intercom;