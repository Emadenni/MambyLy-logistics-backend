import Joi from "joi";

export const positionSchema = Joi.object({
  positionId: Joi.string().min(2).max(20).required(),
  departure: Joi.string().email().max(20).required(),
  destination: Joi.string().min(3).max(20).required(),
  distance: Joi.string().min(10).max(10).required(),
  type: Joi.string().min(10).max(30).required(),
});

