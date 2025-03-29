import Joi from "joi";

export const positionSchema = Joi.object({
  departure: Joi.string().min(2).max(20).required(),
  destination: Joi.string().min(3).max(20).required(),
  distance: Joi.string().min(3).max(10).required(),
  type: Joi.string().min(3).max(30).required(),
});

