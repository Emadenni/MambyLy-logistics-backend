import Joi from "@hapi/joi";

export const validate = async (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    throw new Error(
      JSON.stringify(
        error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
      )
    );
  }

  return value;
};
