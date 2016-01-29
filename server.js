const config = require('config');
const restify = require('restify');
const Promise = require('bluebird');
const URL = require('url');

const logger = require('./utils/logger');
const yeller = require('./utils/yeller');
const googleAnalytics = require('./lib/google-analytics');
const intercom = require('./lib/intercom');

const server = restify.createServer({
  name: 'myst'
});

server.use(restify.CORS());
server.use(restify.bodyParser({ mapParams: true }));

/*
 * GET /health
 * Opsee/AWS health check endpoint
 */
server.get('/health', (req, res, next) => {
  res.send(200);
  next();
});

/*
 * Logging middleware for all API requests
 */
server.use((req, res, next) => {
  logger.info(req.method, req.url, req.params);
  next();
});

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
 * @param {String} user.id - (required) the opsee ID of the user's account.
 *    This is used to identify them in intercom.io.
 *
 * @param {string} user.uuid - (optional)
 *
 * @param {object} data - any additional JSON data to be tracked along with
 *    the event
 */
server.post('event', (req, res, next) => {
  const hostname = URL.parse(req.headers.origin).hostname;

  const category = req.params.category;
  const action = req.params.action;
  const user = req.params.user;
  const data = req.params.data;

  if (!category || typeof category !== 'string') {
    return next(new restify.InvalidArgumentError('Missing category parameter'));
  }

  Promise.join(
    intercom.track(category, action, user, data),
    googleAnalytics.track(hostname, category, action, user, data)
  ).then(() =>  {
    res.send(200);
    return next();
  })
  .catch(err => {
    logger.error(err);
    res.send(500);
    return next();
  });
});

/**
 * POST /pageview
 * Updates authenticated users' "last seen" time in Intercom
 *
 * NOTE: Previously, Myst tracked page views in Google Analytics, in addition
 * to Intercom. However, the Google Analytics snippet is able to provide
 * far more information (referrer, location, etc.). Please use that instead
 * of relying on Myst for pageviews in Google Analytics.
 *
 * TODO: investigate https://www.npmjs.com/package/universal-analytics#session-based-identification
 *
 * @param {object} user - required
 * @param {string} user.id - required; used to update "last seen" in Intercom
 */
server.post('pageview', (req, res, next) => {
  const user = req.params.user;

  // TODO: add validation for user.id once clients (Emissary, McMahon) stop
  // POSTing unauthenticated page views to Myst. For now, silently ignore
  // logging unauthenticated users to Intercom.
  if (!user || !user.id) {
    res.send(200);
    return next();
  }

  intercom
    .updateUser(user)
    .then(() => {
      res.send(200);
      return next();
    })
    .catch(err => {
      logger.error(err);
      res.send(500);
      return next();
    });
});

/**
 * POST /user
 *
 * @param {object} user
 * @param {string} user.id - required
 * @param {string} user.email - optional
 * @param {string} user.name - optional
 * @param {object} user.custom_attributes - optional
 */
server.post('user', (req, res, next) => {
  const user = req.params.user;

  if (!user || !user.id) {
    return next(new restify.InvalidArgumentError('Missing user.id parameter'));
  }

  intercom
    .updateUser(user)
    .then(() => {
      res.send(200);
      return next();
    })
    .catch(err => {
      logger.error(err);
      res.send(500);
      return next();
    });
});

/**
 * Catch-all exception handler for internal errors (i.e., 5xx-type things).
 * Logs to Papertrail & Yeller.
 */
server.on('uncaughtException', (req, res, route, error) => {
  const method = req.method;
  const path = route.path;
  const params = req.params;

  logger.error(method, path, params, error);

  yeller.report(error, {
    customData: { path, method, params }
  });

  // Do not return 5xx errors to the client, silently fail instead.
  // (Only 4xx errors are returned, so analytics can be fire-and-forget for clients.)
  return res.send(200);
});

module.exports = {
  server: server,

  start() {
    server.listen(config.server.port, () => {
      logger.info(`${process.env.NODE_ENV} server ${server.name} listening at ${server.url}`);
    });
  }
};
