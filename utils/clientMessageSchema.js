import Joi from "joi";

export const clientMessageSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(3).max(255).required(),
  textMessage: Joi.string().min(10).max(2000).required(),
});

