const intercom = require('./lib/intercom');

module.exports = {

  event(category, action, user, data) {
    const now = new Date();
    const createdAt = Math.floor(now.getTime() / 1000);

    console.log(category, action, user, data);

    return intercom.events.create({
      event_name: 'test',
      email: user.email,
      created_at: createdAt
    });
  }
};