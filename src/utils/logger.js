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
const errorHasStack = (error) => error instanceof Error && error.stack;
const envirommentIsProd = process.env.NODE_ENV === 'production';

let remoteLogger = {};

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
    if (typeof metadata === 'object') return Object.entries(metadata).reduce((acc, [key, value]) => acc.concat(`${key}=${errorHasStack(value) ? value.stack : value} `), '');
    return '';
  };

  return { prefix: { reqId, username }, suffix: getSuffixFormat() };
};

const handleLog = (formatter, level, shouldShowMetada) => (message, metadata) => {
  const { prefix: { username, reqId }, suffix } = createLogPrefixAndSuffix(metadata, shouldShowMetada);
  const prefixToLog = `[${reqId ? ` reqId: ${reqId} - ${username} ` : ''}]`;

  formatter[level]({ message, prefix: prefixToLog, suffix });

  if (level !== 'debug' && envirommentIsProd) {
    let metadataToLog;
    let objectMetadata = {};
    if (errorHasStack(metadata)) metadataToLog = JSON.stringify(metadata.stack);
    else if (typeof metadata === 'object') objectMetadata = metadata;
    else metadataToLog = metadata;

    remoteLogger.log({ level, message, reqId, username, metadata: metadataToLog, ...objectMetadata });
  }
};

const initLogger = ({ name, verbose }) => {
  const shouldShowMetada = typeof verbose === 'undefined' ? config.get('logger.verbose') : verbose;
  const options = {
    scope: name,
    types: { debug: { color: 'magenta', label: 'debug', logLevel: 'debug' } },
  };

  const formatter = new Signale(options);
  formatter.config({ displayTimestamp: true, uppercaseLabel: true });

  const logger = levels.reduce((finalLogger, level) => ({ ...finalLogger, [level]: handleLog(formatter, level, shouldShowMetada) }), {});

  return logger;
};

module.exports = {
  initLogger,
  flushLogs: remoteLogger.flushLogs,
};
