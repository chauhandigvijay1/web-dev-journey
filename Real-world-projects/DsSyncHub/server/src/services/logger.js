const pino = require('pino')

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', 'body.password', 'body.currentPassword', 'body.newPassword'],
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { 'user-agent': req.headers?.['user-agent'], 'content-type': req.headers?.['content-type'] },
    }),
    res: (res) => ({ statusCode: res.statusCode }),
    err: pino.stdSerializers.err,
  },
})

module.exports = logger
