const googleAnalytics = require('./lib/google-analytics');
const intercom = require('./lib/intercom');
const Promise = require('bluebird');

module.exports = {

  event(hostname, category, action, user, data) {
    return Promise.join(
      intercom.track(category, action, user, data),
      googleAnalytics.track(hostname, category, action, user, data)
    );
  },

  pageview(hostname, path, name, user) {
    // Pageviews are tracked as events in Intercom for authenticated users
    // (to update the 'last seen') field. Pageviews for unatheticated users
    // are only tracked in Google Analytics.
    const isAuthenticated = !!user && !!user.id;

    return Promise.join(
      googleAnalytics.pageview(hostname, path, name, user),
      isAuthenticated ? intercom.updateUser(user) : Promise.resolve()
    );
  },

  updateUser(hostname, user) {
    return intercom.updateUser(user);
  }
};