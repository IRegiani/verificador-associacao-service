const config = require('config');
const requestContext = require('express-http-context');
const SumoLogger = require('sumo-logger');
const { Signale } = require('signale');

const remoteLoggerConfig = {
  endpoint: config.get('logger.url'),
  interval: 30000,
  batchSize: 100000,
  sendErrors: true,
  sourceName: 'verificador-associacao-service',
};

const levels = ['info', 'error', 'success', 'warn', 'debug', 'complete'];
const options = { types: { debug: { color: 'magenta', label: 'debug', logLevel: 'debug' } } };

const errorHasStack = (error) => error instanceof Error && error.stack;
const envirommentIsProd = process.env.NODE_ENV === 'production';

let remoteLogger = {};
const formatter = new Signale(options);
formatter.config({ displayTimestamp: true, uppercaseLabel: true });

if (envirommentIsProd) {
  remoteLogger = new SumoLogger(remoteLoggerConfig);
}

const createLogPrefixAndSuffix = (metadata, shouldShowMetada) => {
  const reqId = requestContext.get('reqId');
  const username = requestContext.get('username');

  const getSuffixFormat = () => {
    if (!shouldShowMetada) return '';
    if (errorHasStack(metadata)) return `\n${metadata.stack}`;
    if (typeof metadata !== 'object') return metadata;
    if (typeof metadata === 'object') return Object.entries(metadata).reduce((acc, [key, value]) => acc.concat(errorHasStack(value) ? `\n${value.stack}` : `${key}=${value} `), '');
    return '';
  };

  return { prefix: { reqId, username }, suffix: getSuffixFormat() };
};

const handleLog = (level, shouldShowMetada, name) => (message, metadata) => {
  const { prefix: { username, reqId }, suffix } = createLogPrefixAndSuffix(metadata, shouldShowMetada);
  const prefixToLog = `[${reqId ? ` reqId: ${reqId} - ${username} ` : ''}]`;

  formatter.scope(name)[level]({ message, prefix: prefixToLog, suffix });

  if (level !== 'debug' && envirommentIsProd) {
    let metadataToLog;
    let objectMetadata = {};
    if (errorHasStack(metadata)) metadataToLog = JSON.stringify(metadata.stack);
    else if (typeof metadata === 'object') objectMetadata = metadata;
    else metadataToLog = metadata;

    remoteLogger.log({ level, message, reqId, src_user: username, metadata: metadataToLog, ...objectMetadata });
  }
};

const initLogger = ({ name, verbose }) => {
  const shouldShowMetada = typeof verbose === 'undefined' ? config.get('logger.verbose') : verbose;

  const logger = levels.reduce((finalLogger, level) => ({ ...finalLogger, [level]: handleLog(level, shouldShowMetada, name) }), {});
  logger.flush = envirommentIsProd ? async () => remoteLogger.sendLogs() : () => {};

  return logger;
};

module.exports = {
  initLogger,
};
