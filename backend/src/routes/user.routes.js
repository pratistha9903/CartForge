import { Router } from 'express';
import {
  createUserHandler,
  loginHandler,
  getUserHandler,
} from '../controllers/user.controller.js';
import {
  validate,
  createUserRules,
  loginRules,
  userIdParamRules,
} from '../validators/cart.validator.js';

const router = Router();

router.post('/', validate(createUserRules), createUserHandler);
router.post('/login', validate(loginRules), loginHandler);
router.get('/:userId', validate(userIdParamRules), getUserHandler);

export default router;
