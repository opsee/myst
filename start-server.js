const config = require('config');
const logger = require('./utils/logger');
const server = require('./server');

server.listen(config.server.port, () => {
  logger.info(`${process.env.NODE_ENV} server ${server.name} listening at ${server.url}`);
});
