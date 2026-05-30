const winston = require('winston');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.label({ label: 'backend-api' }),
  winston.format.json(),
  winston.format.align()
);

const Logger = winston.createLogger({
  level: 'debug', // allow all, transports will filter
  format: baseFormat,

  transports: [
    //  INFO ONLY
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info'
    }),

    //  WARN ONLY
    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn'
    }),

    //  ERROR ONLY
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),


    new winston.transports.File({
  filename: path.join(logDir, 'slowQueries.log'),
  level: 'warn',
  format: winston.format.combine(
    winston.format.label({ label: 'slow-query' }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  )
}),

    //  COMBINED (ALL)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    }),

    // 🖥 Console (dev & docker)
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) =>
          stack
            ? `${timestamp} ${level}: ${stack}`
            : `${timestamp} ${level}: ${message}`
        )
      )
    })
  ]
});

//  Crash & promise safety
Logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'exceptions.log')
  })
);

Logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'rejections.log')
  })
);

module.exports = { Logger };
