const config = require('config');
const Intercom = require('intercom-client');
const logger = require('../utils/logger');

// For documentation, see https://github.com/intercom/intercom-node
const intercom = new Intercom.Client({
  appId: config.intercom.app_id,
  appApiKey: config.intercom.app_api_key
}).usePromises();

function track(category, action, user, data) {
  if (!user || !user.id) {
    return Promise.reject('Missing user.id parameter');
  }

  const eventString = `${category} - ${action || ''}`;
  const now = new Date();
  const createdAt = Math.floor(now.getTime() / 1000);

  const event = {
    event_name: eventString,
    user_id: user.id,
    created_at: createdAt
  };

  // TODO -- if the user doesn't yet exist in Intercom, this will
  // throw an error. This is an issue with log-ins... in most cases,
  // we should probably just catch the error and create the user
  // in Intercom. (Or, it's possible Emissary is posting the wrong
  // data, without a user ID, on logins)
  return intercom.events.create(event)
    .catch(err => {
      logger.error('Error: no user found for ID ' + user.id);
      // FIXME use error object, this is an abomination
      return updateUser(user)
        .then(() => {
          logger.info('Created missing user', user);
          return track(category, action, user, data)
            .then(() => {
              logger.info('Relogged event for user' + user.id);
            });
        });
    });
}

function updateUser(user) {
  if (!user.id) {
    return Promise.resolve();
  }

  // FIXME don't overwrite intercom data as empty if any parameters undefined
  return intercom.users.create({
    email: user.email,
    user_id: user.id,
    name: user.name,
    custom_attributes: user.custom_attributes
  });
}

module.exports = {
  track: track,
  updateUser: updateUser
};