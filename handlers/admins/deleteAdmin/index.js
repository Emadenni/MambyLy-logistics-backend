import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { deleteAdmin } from "../../../services/adminServices.js";
import { auth } from "../../../middlewares/auth.js";

const deleteAdminHandler = async (event) => {
  try {
    const { adminId } = event.pathParameters;
    const response = await deleteAdmin(adminId);

    return sendSuccessResponse(200, {
      message: response.message,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(deleteAdminHandler).use(auth());
