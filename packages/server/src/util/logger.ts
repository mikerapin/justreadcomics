import pino from 'pino';
import pinoHttp from 'pino-http';

const PINO_CONFIG = {
  level: process.env.PINO_LOG_LEVEL || 'info',
  formatters: {
    level: (label: any) => {
      return { level: label.toUpperCase() };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  target: 'pino-pretty',
  options: {
    colorize: true
  }
};

const PINO_LOG_FILENAME = 'pino-logger.log';
const PINO_LOG_FILE = `./${PINO_LOG_FILENAME}`;

const fileTransport = pino.transport({
  target: 'pino/file',
  options: { destination: PINO_LOG_FILE }
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ignore: 'pid'
  },
  fileTransport
);

export const loggerMiddleware = pinoHttp(PINO_CONFIG, fileTransport);
export const logFatal = (data: any) => {
  logger.fatal(data);
};
export const logError = (data: any) => {
  logger.error(data);
};

export const logInfo = (data: any) => {
  logger.info(data);
};
