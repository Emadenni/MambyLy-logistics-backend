import Joi from "joi";

export const jobMessageSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(3).max(255).required(),
  textMessage: Joi.string().min(10).max(2000).required(),
  uploadCvBase64: Joi.string().base64().optional(),
  mimetype: Joi.string()
    .valid(
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    .optional(),
});
