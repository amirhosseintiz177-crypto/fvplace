function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.', path: req.originalUrl });
}

function errorHandler(error, req, res, next) {
  if (error.name === 'ZodError') {
    return res.status(422).json({ message: 'Validation failed.', issues: error.issues });
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Uploaded file exceeds the configured size limit.' });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    message: error.expose ? error.message : 'Internal server error.',
  });
}

module.exports = { notFound, errorHandler };
