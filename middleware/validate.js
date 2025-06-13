const { ObjectId } = require('mongodb');

const validateId = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
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
  validateMessage
}; 