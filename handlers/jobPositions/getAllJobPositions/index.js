import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getAllJobPositions } from "../../../services/jobPositionsService.js";


const getAllJobPositionsHandler = async (event) => {
  try {

    const positions = await getAllJobPositions();

    return sendSuccessResponse(200, positions); 
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(getAllJobPositionsHandler);
