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

module.exports = {

  track(category, action, user, data) {
    const eventString = `${category} - ${action || ''}`;
    const now = new Date();
    const createdAt = Math.floor(now.getTime() / 1000);

    return intercom.events.create({
      event_name: eventString,
      email: user.email,
      created_at: createdAt,
      update_last_request_at: true,
      last_request_at: createdAt,
      metadata: data
    }).then(resolve);
  },

  updateUser(user) {
    // FIXME don't overwrite intercom data as empty if any parameters undefined
    return new Promise((resolve, reject) => {
      intercom.users.create({
        email: user.email,
        user_id: user.id,
        name: user.name,
        custom_attributes: user.custom_attributes
      }).then(resolve)
    });
  }
}