const googleAnalytics = require('./lib/google-analytics');
const intercom = require('./lib/intercom');
const Promise = require('bluebird');

module.exports = {

  event(category, action, user, data) {
    return Promise.join(
      intercom.track(category, action, user, data),
      googleAnalytics.track(category, action, user, data)
    );
  },

  pageview(path, name, user) {
    return Promise.join(
      googleAnalytics.pageview(path, name, user),
      intercom.updateUser(user)
    );
  },

  updateUser(user) {
    return intercom.updateUser(user);
  }
};