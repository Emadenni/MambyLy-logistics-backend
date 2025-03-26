import Joi from "joi";

export const adminSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)  
    .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$'))  
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one letter, one number, and one special character (!@#$%^&*).',
    }),
  profileImage: Joi.string().uri().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const updateAdminSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  profileImage: Joi.string().uri().optional(), 
});