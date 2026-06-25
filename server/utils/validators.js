const { body } = require('express-validator');

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const healthLogValidation = [
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('sleep')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep must be between 0 and 24 hours'),
  body('waterIntake')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Water intake must be between 0 and 20 liters'),
  body('steps')
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage('Steps must be between 0 and 100,000'),
  body('calories')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Calories must be between 0 and 10,000'),
  body('exerciseDuration')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('Exercise duration must be between 0 and 600 minutes'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('heartRate')
    .optional()
    .isInt({ min: 30, max: 250 })
    .withMessage('Heart rate must be between 30 and 250 bpm'),
  body('mood')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood must be between 1 and 10'),
];

const simulationValidation = [
  body('params').isObject().withMessage('Simulation parameters are required'),
  body('params.sleep').optional().isFloat({ min: 0, max: 24 }),
  body('params.steps').optional().isInt({ min: 0, max: 100000 }),
  body('params.waterIntake').optional().isFloat({ min: 0, max: 20 }),
  body('params.calories').optional().isInt({ min: 0, max: 10000 }),
  body('params.exerciseDuration').optional().isInt({ min: 0, max: 600 }),
  body('params.mood').optional().isInt({ min: 1, max: 10 }),
  body('days')
    .optional()
    .isInt({ min: 7, max: 90 })
    .withMessage('Simulation days must be between 7 and 90'),
];

module.exports = {
  signupValidation,
  loginValidation,
  healthLogValidation,
  simulationValidation,
};
