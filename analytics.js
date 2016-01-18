const intercom = require('./lib/intercom');

module.exports = {

  event: () => {
    return Promise.resolve({ hello: 'world' });
  }
};