import middy from "@middy/core";
import { registerAdmin } from "../../../services/adminServices.js";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { validation } from "../../../middlewares/validation.js";
import { adminSchema } from "../../../utils/adminSchema.js";
import { auth } from "../../../middlewares/auth.js";

const registerAdminHandler = async (event) => {
  try {
    const adminData = event.body;
    const admin = await registerAdmin(adminData);

    return sendSuccessResponse(201, {
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    if (error.message === "Email Already in use") {
      return sendError(400, error.message);
    }

    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(registerAdminHandler).use(auth()).use(validation(adminSchema));
