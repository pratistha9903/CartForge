import {
  createUser,
  loginUser,
  getUserById,
} from '../services/user.service.js';

export async function createUserHandler(req, res, next) {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const user = await loginUser(req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    next(error);
  }
}

export async function getUserHandler(req, res, next) {
  try {
    const user = await getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
