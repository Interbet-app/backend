import winston from "winston";

const logger = winston.createLogger({
   format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json(),
      winston.format.printf(
         (info) =>
            `{"level":"${info.level}","time":"${info.timestamp}","message":"${info.message}", "stack": "${info.stack || "no stack"}"}`
      )
   ),
   transports: [
      new winston.transports.File({ filename: "logs/error.log", level: "error" }),
      new winston.transports.File({ filename: "logs/info.log", level: "info" }),
   ],
});

if (process.env.NODE_ENV !== "production") {
   logger.add(
      new winston.transports.Console({
         format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.timestamp({
               format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.printf((info) => `@interbet-${info.level}: ${info.timestamp} -> ${info.message}`)
         ),
      })
   );
}

export default logger;

