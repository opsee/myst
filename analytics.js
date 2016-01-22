const googleAnalytics = require('./lib/google-analytics');
const intercom = require('./lib/intercom');
const Promise = require('bluebird');

function formatEventString(category, action) {
  return `${category} - ${action || ''}`;
}

function trackIntercom(category, action, user, data) {
  const eventString = formatEventString(category, action);
  const now = new Date();
  const createdAt = Math.floor(now.getTime() / 1000);

  return intercom.events.create({
    event_name: eventString,
    email: user.email,
    created_at: createdAt,
    update_last_request_at: true,
    last_request_at: createdAt,
    metadata: data
  });
}

module.exports = {

  event(category, action, user, data) {
    return Promise.join(
      trackIntercom(category, action, user, data),
      googleAnalytics.track(category, action, user, data),

      (intercomResponse) => {
        return intercomResponse.body;
      }
    );
  },

  pageview(path, name, user) {
    return googleAnalytics.pageview(path, name, user);
  },

  updateUser(user) {
    // FIXME don't overwrite intercom data as empty if any parameters undefined
    return intercom.users.create({
      email: user.email,
      user_id: user.id,
      name: user.name,
      custom_attributes: user.custom_attributes
    });
  }
};