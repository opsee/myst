const analytics = require('./analytics');
const config = require('config');
const logger = require('./utils/logger');
const restify = require('restify');

const server = restify.createServer({
  name: 'analytics'
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

  analytics
    .event(category, action, user, data)
    .then(resp => {
      res.send(resp);
      next();
    }).catch(err => {
      logger.error(err);
      res.send(err);
      next();
    });
});

/**
 * POST /pageview
 *
 * @param {String} path
 * @param {String} name
 */
server.post('pageview', (req, res, next) => {
  analytics
    .pageview(req.params.path, req.params.name, req.params.user)
    .then(resp => {
      res.send(resp);
      next();
    })
    .catch(err => {
      logger.error(err);
      res.send(err);
      next();
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

server.listen(config.server.port, () => {
  logger.info(`${process.env.NODE_ENV} server ${server.name} listening at ${server.url}`);
});