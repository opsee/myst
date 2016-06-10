const _ = require('lodash');
const config = require('config');
const Intercom = require('intercom-client');
const logger = require('../utils/logger');
const yeller = require('../utils/yeller');

// For documentation, see https://github.com/intercom/intercom-node
const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key
}).usePromises();

function track(category, action, user, data) {
  if (!user || !user.id) {
    return Promise.resolve('Missing user.id parameter');
  }

  const eventString = `${category} - ${action || ''}`;

  // Generate a UTC Unix timestamp, as required by Intercom
  // @see https://developers.intercom.io/docs/event-model
  const now = new Date();
  const createdAt = Math.floor(now.getTime() / 1000);

  const event = {
    event_name: eventString,
    user_id: user.id,
    created_at: createdAt,
    metadata: data || {} // Intercom won't register events with data=null
  };

  return intercom.events.create(event)
    .catch(err => {
      // When trying to create an event for a user that doesn't exist in Intercom,
      // a 404 will be returned; in this case, we create the user and
      // attempt to log the event again. (Note that this is mostly a concern with
      // our Intercom sandbox environment, as all production users are created
      // in production Intercom on sign-up.
      const errorBody = err.message ? JSON.parse(err.message) : null;

      if (errorBody && errorBody.statusCode === 404) {
        logger.error('Error: no user found for ID ' + user.id);
        return updateUser(user)
          .then(() => {
            logger.info('Created missing user', user);
            return track(category, action, user, data)
              .then(() => {
                logger.info('Relogged event for user' + user.id);
              });
          });
      } else {
        const errorMessage = _.chain(errorBody).get('body.errors').first().get('message').value();
        yeller.report(errorMessage);
        logger.error(errorMessage);
      }
    });
}

function updateUser(user) {
  if (!user || !user.id) {
    return Promise.resolve('Missing user.id parameter');
  }

  const update = {
    user_id: user.id,
    update_last_request_at: true
  };

  // Don't include any attributes with null/undefined values or else
  // Intercom will overwrite existing data as blank.
  ['email', 'name', 'custom_attributes'].forEach(key => {
    if (key in user) update[key] = user[key];
  });

  return intercom.users.create(update);
}

module.exports = {
  track: track,
  updateUser: updateUser
};