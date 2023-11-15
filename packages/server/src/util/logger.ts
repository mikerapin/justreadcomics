import pino from 'pino';
import pinoHttp from 'pino-http';

const PINO_CONFIG = {
  level: process.env.PINO_LOG_LEVEL || 'info',
  formatters: {
    level: (label: any) => {
      return { level: label.toUpperCase() };
    }
  },
  redact: {
    paths: ['authorization', 'req.headers.authorization'],
    censor: '***bearer token***'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
};

const PINO_LOG_FILENAME = 'pino-logger.log';
const PINO_LOG_FILE = `./${PINO_LOG_FILENAME}`;

const logger = pino(PINO_CONFIG);

export const loggerMiddleware = pinoHttp(PINO_CONFIG);
export const logFatal = (data: any) => {
  logger.fatal(data);
};
export const logError = (data: any) => {
  logger.error(data);
};

export const logInfo = (data: any) => {
  logger.info(data);
};
