// Small, dependency-free validators. Each returns an array of error strings
// (empty array = valid) so the API can return all problems at once.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = ({ name, email, password } = {}) => {
  const errors = [];
  if (!name || !String(name).trim()) errors.push('Name is required');
  if (!email || !EMAIL_RE.test(String(email))) errors.push('A valid email is required');
  if (!password || String(password).length < 8) errors.push('Password must be at least 8 characters');
  return errors;
};

module.exports = { validateRegister };