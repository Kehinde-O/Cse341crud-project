const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return res.status(400).json({
      message: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'MongoServerError' && err.code === 11000) {
    // Duplicate key error
    return res.status(409).json({
      message: 'Duplicate Key Error',
      details: 'A record with that information already exists'
    });
  }
  
  if (err.name === 'CastError') {
    // Invalid ID format
    return res.status(400).json({
      message: 'Invalid ID Format',
      details: 'The provided ID is not valid'
    });
  }
  
  // Default server error
  return res.status(500).json({
    message: 'Internal Server Error',
    details: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};

module.exports = errorHandler; 