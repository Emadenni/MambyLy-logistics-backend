import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { updateJobPosition } from "../../../services/jobPositionsService.js";
import { auth } from "../../../middlewares/auth.js";

const updateJobPositionHandler = async (event) => {
  try {
    const { positionId } = event.pathParameters;
    const { createdAt } = JSON.parse(event.body);
    const updatedData = JSON.parse(event.body);

    delete updatedData.createdAt;

    const response = await updateJobPosition(positionId, createdAt, updatedData);

    return sendSuccessResponse(200, response);
  } catch (error) {
    console.error("Error:", error.message);
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(updateJobPositionHandler).use(auth());
