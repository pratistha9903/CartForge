import { User } from '../models/User.js';

export async function createUser({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('Email is already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const user = await User.create({ name, email, password });
  return serializeUser(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  return serializeUser(user);
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return serializeUser(user);
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
