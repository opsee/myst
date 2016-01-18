const config  = require('config');
const logger  = require('./utils/logger');
const restify = require('restify');

const server = restify.createServer({
  name: 'analytics'
});

server.get('/health', (req, res, next) => {
  res.send(200);
  next();
});

server.listen(config.server.port, () => {
  logger.info(`${process.env.NODE_ENV} server ${server.name} listening at ${server.url}`);
});