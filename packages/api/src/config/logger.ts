export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;

class Logger {
  private prefix(level: LogLevel): string {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
  }

  error(message: string, error?: Error | unknown): void {
    if (LOG_LEVELS.error <= currentLogLevel) {
      console.error(this.prefix(LogLevel.ERROR), message);
      if (error instanceof Error) {
        console.error(error.stack);
      } else if (error) {
        console.error(error);
      }
    }
  }

  warn(message: string, data?: unknown): void {
    if (LOG_LEVELS.warn <= currentLogLevel) {
      console.warn(this.prefix(LogLevel.WARN), message, data ? data : '');
    }
  }

  info(message: string, data?: unknown): void {
    if (LOG_LEVELS.info <= currentLogLevel) {
      console.log(this.prefix(LogLevel.INFO), message, data ? data : '');
    }
  }

  debug(message: string, data?: unknown): void {
    if (LOG_LEVELS.debug <= currentLogLevel) {
      console.debug(this.prefix(LogLevel.DEBUG), message, data ? data : '');
    }
  }
}

export const logger = new Logger();
