const { ObjectId } = require('mongodb');

const validateId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

const validateUser = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  const errors = [];
  
  // Check required fields
  if (!username) errors.push('Username is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (!firstName) errors.push('First name is required');
  // lastName is optional
  
  // Validate username format
  if (username && (username.length < 3 || username.length > 30)) {
    errors.push('Username must be between 3 and 30 characters');
  }
  
  // Validate email format
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email format is invalid');
    }
  }
  
  // Validate password
  if (password && password.length < 7) {
    errors.push('Password must be at least 7 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateMessage = (req, res, next) => {
  const { recipient, content } = req.body;
  
  const errors = [];
  
  // Check required fields (sender comes from authentication)
  if (!recipient) errors.push('Recipient is required');
  if (!content) errors.push('Content is required');
  
  // Validate recipient ID
  if (recipient && !ObjectId.isValid(recipient)) {
    errors.push('Invalid recipient ID format');
  }
  
  // Validate content length
  if (content && content.length > 1000) {
    errors.push('Message content must be less than 1000 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateId,
  validateUser,
  validateMessage
}; 