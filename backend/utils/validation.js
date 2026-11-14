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

// partial = true for updates: only validate the fields that were sent.
const validatePlan = (body = {}, partial = false) => {
  const errors = [];
  const has = (k) => body[k] !== undefined;

  if (!partial || has('name')) {
    if (!body.name || !String(body.name).trim()) errors.push('Plan name is required');
    else if (String(body.name).length > 60) errors.push('Plan name must be 60 characters or fewer');
  }
  if (has('description') && String(body.description).length > 300) {
    errors.push('Description must be 300 characters or fewer');
  }
  if (!partial || has('durationMonths')) {
    const d = Number(body.durationMonths);
    if (!Number.isInteger(d) || d < 1 || d > 24) errors.push('Duration must be a whole number of months between 1 and 24');
  }
  if (!partial || has('price')) {
    const p = Number(body.price);
    if (body.price === '' || body.price === null || Number.isNaN(p) || p < 0) errors.push('Price must be a number of 0 or more');
  }
  if (has('isActive') && typeof body.isActive !== 'boolean') errors.push('isActive must be true or false');
  return errors;
};

const validateMembershipRequest = ({ planId, startDate } = {}, now = new Date()) => {
  const errors = [];
  if (!planId) errors.push('Please choose a plan');
  if (!startDate) {
    errors.push('Start date is required');
  } else {
    const start = new Date(startDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const maxStart = new Date(today);
    maxStart.setDate(maxStart.getDate() + 60);
    if (Number.isNaN(start.getTime())) errors.push('Start date is not a valid date');
    else if (start < today) errors.push('Start date cannot be in the past');
    else if (start > maxStart) errors.push('Start date must be within the next 60 days');
  }
  return errors;
};

module.exports = { validateRegister, validatePlan, validateMembershipRequest };