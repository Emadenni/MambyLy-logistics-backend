import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getAdmin } from "../../../services/adminServices.js";

const getAdminHandler = async (event) => {
  try {
    const { adminId } = event.queryStringParameters;

    if (!adminId) {
      throw new Error("Admin ID is required");
    }

    const admin = await getAdmin(adminId);

    return sendSuccessResponse(200, admin);
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(getAdminHandler).use(auth());
