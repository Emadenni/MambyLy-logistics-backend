import jwt from "jsonwebtoken";
import { sendError } from "../responses/index.js";

export const auth = () => {
  return {
    before: async (request) => {
      try {
        const authHeader = request.event.headers.Authorization || request.event.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error(JSON.stringify([{ field: "Authorization", message: "Missing or invalid authorization header" }]));
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        request.event.user = decoded;
      } catch (error) {
        try {
          const errorMessages = JSON.parse(error.message)
            .map((err) => `${err.field}: ${err.message}`)
            .join(". ");
          return sendError(401, `Unauthorized: ${errorMessages}`);
        } catch (parseError) {
          return sendError(401, `Unauthorized: ${error.message}`);
        }
      }
    },
  };
};
