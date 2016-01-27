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
    // Pageviews are tracked as events in Intercom for authenticated users
    // (to update the 'last seen') field. Pageviews for unatheticated users
    // are only tracked in Google Analytics.
    const isAuthenticated = !!user && !!user.id;

    return Promise.join(
      googleAnalytics.pageview(path, name, user),
      isAuthenticated ? intercom.updateUser(user) : Promise.resolve()
    );
  },

  updateUser(user) {
    return intercom.updateUser(user);
  }
};