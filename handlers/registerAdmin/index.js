import middy from "@middy/core";
import { registerAdmin } from "../../services/adminServices.js";
import { sendSuccessResponse, sendError} from "../../responses/index.js" ;
import { validationMiddleware } from "../../middleware/validationMiddleware.js";
import { adminSchema } from "../../utils/adminSchema.js";

const registerAdminHandler = async (event) => {
  try {
    const adminData = event.body;
    const admin = await registerAdmin(adminData);

    return sendSuccessResponse(201, {
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(registerAdminHandler).use(validationMiddleware(adminSchema));
