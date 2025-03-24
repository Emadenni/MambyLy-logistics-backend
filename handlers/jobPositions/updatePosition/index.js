import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { updateJobPosition } from "../../../services/jobPositionsService.js";
import { auth } from "../../../middlewares/auth.js";

const updateJobPositionHandler = async (event) => {
  try {
    const { positionId } = event.pathParameters; 

    const updatedPosition = await updateJobPosition(positionId);

    return sendSuccessResponse(200, updatedPosition); 
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(updateJobPositionHandler).use(auth());
