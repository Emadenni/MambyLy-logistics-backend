import jwt from "jsonwebtoken";
import { sendError } from "../responses/index.js";

export const auth = () => {
  return {
    before: async (request) => {
      try {
        const authHeader = request.event.headers.Authorization || request.event.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error("Missing or invalid authorization header");
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        request.event.user = decoded; 
      } catch (error) {
        throw new Error("Unauthorized: " + error.message); 
      }
    },
  };
};
