import pino from "pino";
import pinoHttp from "pino-http";
import { isDevelopment } from "./process";

const PINO_CONFIG = {
  level: process.env.PINO_LOG_LEVEL || "info",
  formatters: {
    level: (label: any) => {
      return { level: label.toUpperCase() };
    },
  },
  redact: {
    paths: ["authorization", "req.headers.authorization"],
    censor: "***bearer token***",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
};

const PINO_LOG_FILENAME = "pino-logger.log";
const PINO_LOG_FILE = `./${PINO_LOG_FILENAME}`;

const logger = pino(PINO_CONFIG);

export const loggerMiddleware = pinoHttp(PINO_CONFIG);
export const logFatal = (data: any) => {
  if (isDevelopment()) {
    console.log("FATAL");
    console.log(data);
  }
  logger.fatal(data);
};
export const logError = (data: any) => {
  if (isDevelopment()) {
    console.log("ERROR");
    console.log(data);
  }
  logger.error(data);
};

export const logInfo = (data: any) => {
  if (isDevelopment()) {
    console.log("INFO");
    console.log(data);
  }
  logger.info(data);
};
