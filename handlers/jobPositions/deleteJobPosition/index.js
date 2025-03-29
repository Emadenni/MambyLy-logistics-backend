import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";  
import { deleteJobPosition } from "../../../services/jobPositionsService.js";  
import { auth } from "../../../middlewares/auth.js";  

const deleteJobPositionHandler = async (event) => {
  try {
    const { positionId } = event.pathParameters;  
    const { createdAt } = JSON.parse(event.body);  

    const response = await deleteJobPosition(positionId, createdAt);  

    return sendSuccessResponse(200, response); 
  } catch (error) {
    console.error("Error:", error.message);  
    return sendError(500, error.message || "Internal server error"); 
  }
};

export const handler = middy(deleteJobPositionHandler).use(auth());  
