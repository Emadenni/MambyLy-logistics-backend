import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { deleteAdmin } from "../../../services/adminServices.js";

const deleteAdminHandler = async (event) => {
  try {
    const { adminId } = event.queryStringParameters;

    const response = await deleteAdmin(adminId);

    return sendSuccessResponse(200, {
      message: response.message,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(deleteAdminHandler).use(auth());
