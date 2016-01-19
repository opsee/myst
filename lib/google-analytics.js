const config = require('config');
const ua = require('universal-analytics');

const ACCOUNT_ID = config.google_analytics.account_id;

module.exports = {

  track(category, action, user, data) {
    const actionString = action || 'test action';
    const visitor = ua(ACCOUNT_ID).debug();

    return new Promise((resolve, reject) => {
      visitor.event(category, actionString, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

