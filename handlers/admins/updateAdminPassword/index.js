import middy from "@middy/core";
import { updateAdminPassword } from "../../../services/adminServices.js";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { validation } from "../../../middlewares/validation.js";
import { updatePasswordSchema } from "../../../utils/adminSchema.js";
import { auth } from "../../../middlewares/auth.js";

const updateAdminPasswordHandler = async (event) => {
    try {
      const adminId = event.pathParameters.adminId;  
      const { newPassword } = event.body; 
  
      
      await updateAdminPassword(adminId, newPassword);
  
      return sendSuccessResponse(200, {
        message: "Password updated successfully",  
      });
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };
  
  export const handler = middy(updateAdminPasswordHandler).use(auth()).use(validation(updatePasswordSchema));
  
