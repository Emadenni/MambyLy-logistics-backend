import middy from "@middy/core";
import { updateAdmin } from "../../../services/adminServices.js";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { validation } from "../../../middlewares/validation.js";
import { updateAdminSchema } from "../../../utils/adminSchema.js";
import { auth } from "../../../middlewares/auth.js";

const updateAdminHandler = async (event) => {
    try {
      const adminId = event.pathParameters.adminId;
      const updateData = event.body;
  
      const updatedAdmin = await updateAdmin(adminId, updateData);
  
      return sendSuccessResponse(200, {
        message: "Admin updated successfully",
        updatedAdmin,
      });
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };

export const handler = middy(updateAdminHandler).use(auth()).use(validation(updateAdminSchema));
