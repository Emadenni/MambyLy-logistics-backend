import { sendError } from "../responses/index.js";
import { validate } from "../utils/validationUtils.js"

export const validation = (schema, type = "body") => ({
  before: async (handler) => {
    try {
      const dataToValidate =
        type === "query"
          ? { queryStringParameters: handler.event.queryStringParameters || {} }
          : typeof handler.event.body === "string"
          ? JSON.parse(handler.event.body)
          : handler.event.body;

      const validatedData = await validate(schema, dataToValidate);

      if (type === "query") {
        handler.event.queryStringParameters = validatedData.queryStringParameters;
      } else {
        handler.event.body = validatedData;
      }
    } catch (error) {
      const errorMessages = JSON.parse(error.message)
        .map((err) => `${err.field}: ${err.message}`)
        .join(". ");
      return sendError(400, `Validation failed: ${errorMessages}`);
    }
  },
});
