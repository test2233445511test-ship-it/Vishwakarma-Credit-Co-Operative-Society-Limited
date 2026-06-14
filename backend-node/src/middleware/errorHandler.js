export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

export function errorHandler(err, req, res, _next) {
  console.error(`[Error] ${err.name}: ${err.message}`)

  if (err.name === 'AppError') {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: err.message,
      status: 422,
    })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : err.message,
      status: 400,
    })
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed',
      status: 403,
    })
  }

  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    status: 500,
  })
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
