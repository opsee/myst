const googleAnalytics = require('./lib/google-analytics');
const intercom = require('./lib/intercom');
const logger = require('./utils/logger');
const Promise = require('bluebird');

module.exports = {

  event(category, action, user, data) {
    return Promise.join(
      intercom.track(category, action, user, data),
      googleAnalytics.track(category, action, user, data)
    );
  },

  pageview(path, name, user) {
    // FIXME do we want to track pageviews from unauthenticated users? I'm not
    // sure how we can dedupe them, if so, without storing some kind of
    // anonymous ID on the client.
    if (!user || !user.id) {
      logger.info('Ignoring unauthenticated pageview at ' + path);
      return Promise.resolve();
    }

    return googleAnalytics.pageview(path, name, user);
  },

  updateUser(user) {
    return intercom.updateUser(user);
  }
};