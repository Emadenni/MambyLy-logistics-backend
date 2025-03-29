import middy from "@middy/core";
import { registerSuperAdmin } from "../../../services/adminServices.js";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { validation } from "../../../middlewares/validation.js";
import { adminSchema } from "../../../utils/adminSchema.js";


const registerSuperAdminHandler = async (event) => {
  try {
    const adminData = event.body;
    const superAdmin = await registerSuperAdmin(adminData); 

    return sendSuccessResponse(201, {
      message: "Superadmin registered successfully",
      admin: superAdmin,
    });
  } catch (error) {
    if (error.message === "Email Already in use") {
      return sendError(400, error.message);
    }

    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(registerSuperAdminHandler).use(validation(adminSchema)); 
