import jwt from "jsonwebtoken";
import { sendError } from "../responses/index.js";

export const verifyJWT = (event, context, callback) => {
  const token = event.headers.Authorization;

  if (!token) {
    return sendError(401, "No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);  
    event.user = decoded; 
    callback();  
  } catch (error) {
    return sendError(401, "Invalid or expired token");
  }
};
