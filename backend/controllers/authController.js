const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validateRegister } = require('../utils/validation');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

const toAuthResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user.id, user.role),
});

const registerUser = async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email: String(email).toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'An account with this email already exists' });

    // role is never taken from the request body, so nobody can self-register as admin
    const user = await User.create({ name, email, password });
    return res.status(201).json(toAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  try {
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json(toAuthResponse(user));
    }
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, address } = req.body;
    if (phone && !/^[0-9 +()-]{8,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number looks invalid' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;

    const updated = await user.save();
    return res.json({ ...toAuthResponse(updated), phone: updated.phone, address: updated.address });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
