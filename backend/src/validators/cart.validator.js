import { body, param, validationResult } from 'express-validator';

export const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: errors.array().map((e) => e.msg),
    });
  }

  next();
};

export const createUserRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const addItemRules = [
  body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid userId'),
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('quantity').isInt({ gt: 0 }).withMessage('quantity must be greater than 0'),
  body('category').trim().notEmpty().withMessage('category is required'),
  body('imageUrl').optional().isString(),
];

export const updateQuantityRules = [
  body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid userId'),
  body('quantity').isInt({ gt: 0 }).withMessage('quantity must be greater than 0'),
  param('productId').trim().notEmpty().withMessage('productId is required'),
];

export const removeItemRules = [
  body('userId').notEmpty().withMessage('userId is required').isMongoId().withMessage('Invalid userId'),
  param('productId').trim().notEmpty().withMessage('productId is required'),
];

export const userIdParamRules = [
  param('userId').isMongoId().withMessage('Invalid userId'),
];
