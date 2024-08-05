// loggerUtil.js

const winston = require('winston');
const { format } = winston;

class LoggerUtil {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.options = options;
    this.logger = this.createLogger();
  }

  createLogger() {
    const customFormat = format((info) => {
      info.service = this.serviceName;
      info.custom_field = this.options.customField || 'default_custom_value';
      // Add more custom fields here as needed
      return info;
    });

    return winston.createLogger({
      level: this.options.level || 'info',
      format: format.combine(
        customFormat(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: this.serviceName },
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, service, custom_field, ...metadata }) => {
              let msg = `${timestamp} [${service}] ${level}: ${message}`;
              if (custom_field) {
                msg += ` custom_field=${custom_field}`;
              }
              if (Object.keys(metadata).length > 0) {
                msg += ' ' + JSON.stringify(metadata);
              }
              return msg;
            })
          )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  getLogger() {
    return this.logger;
  }

  static createLogger(serviceName, options = {}) {
    return new LoggerUtil(serviceName, options).getLogger();
  }
}

module.exports = LoggerUtil;
