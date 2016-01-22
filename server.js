const analytics = require('./analytics');
const config = require('config');
const logger = require('./utils/logger');
const restify = require('restify');

const server = restify.createServer({
  name: 'myst'
});

server.use(restify.CORS());
server.use(restify.bodyParser({ mapParams: true }));

/**
 * POST /event
 * Generic event tracking, sent to both Google Analytics and Intercom. The
 * following parameters are accepted:
 *
 * @param {String} category - the broad category for the event. This could also
 *    be thought of as a funnel name; e.g., 'onboard', 'user', 'pageview'
 *
 * @param {String} action - a more specific label describing the event itself.
 *    This could also be thought of as a step in a funnel;
 *    e.g., 'logout', 'check-created', 'menu-clicked'
 *
 * @param {object} user - an object specifying one or more attributes for the
 *    user triggering the event.
 *
 * @param {String} user.email - (required) the email address for the user's account.
 *    This is used to identify them in intercom.io.
 *
 * @param {object} data - any additional JSON data to be tracked along with
 *    the event
 */
server.post('event', (req, res, next) => {
  const category = req.params.category;
  const action = req.params.action;
  const user = req.params.user;
  const data = req.params.data;

  logger.info('/POST event', category, action, user, data);

  analytics
    .event(category, action, user, data)
    .then(() =>  {
      res.send(200);
      return next();
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
});

/**
 * POST /pageview
 *
 * @param {String} path - e.g., '/', '/search?q=foo'
 * @param {String} name - e.g., document.title string
 * @param {object} user - required
 * @param {string} user.id - required; used as cid in Google analytics
 */
server.post('pageview', (req, res, next) => {
  const path = req.params.path;
  const name = req.params.name;
  const user = req.params.user;

  if (!user || !user.id) {
    return next(new restify.InvalidArgumentError('Missing user.id parameter'));
  }

  if (!path || typeof path !== 'string') {
    return next(new restify.InvalidArgumentError('Missing path parameter'));
  }

  if (!name || typeof name !== 'string') {
    return next(new restify.InvalidArgumentError('Missing name parameter'));
  }

  logger.info('/POST pageview', path, name, user);

  analytics
    .pageview(path, name, user)
    .then(() => {
      res.send(200);
      return next();
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
});

/**
 * POST /user
 *
 * @param {object} user
 * @param {string} user.id - required
 * @param {object} user.custom_attributes - optional
 */
server.post('user', (req, res, next) => {
  const user = req.params.user;

  if (!user || !user.id) {
    return next(new restify.InvalidArgumentError('Missing user.id parameter'));
  }

  logger.info('/POST user', user);

  analytics
    .updateUser(user)
    .then(() => {
      res.send(200);
      return next();
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
});

/*
 * GET /health
 * Opsee/AWS health check endpoint
 */
server.get('/health', (req, res, next) => {
  res.send(200);
  next();
});

module.exports = server;
