import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getJobPosition } from "../../../services/jobPositionsService.js";
import { auth } from "../../../middlewares/auth.js";


const getJobPositionHandler = async (event) => {
    try {
      const { positionId } = event.pathParameters; 
  
      const position= await getJobPosition(positionId);
  
      return sendSuccessResponse(200, position);
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };
  
  export const handler = middy(getJobPositionHandler).use(auth());