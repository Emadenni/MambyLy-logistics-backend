import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getAllAdmins } from "../../../services/adminServices.js";

const getAllAdminsHandler = async () => {
  try {
    const admins = await getAllAdmins();

    if (!admins || admins.length === 0) {
      return sendSuccessResponse(200, { message: "No admins found" });
    }

    return sendSuccessResponse(200, admins);
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(getAllAdminsHandler).use(auth());
