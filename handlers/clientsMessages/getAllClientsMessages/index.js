import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getAllClientsMessages } from "../../../services/clientsMessagesService.js";

const getAllClientsMessagesHandler = async () => {
    try {
      const messages = await getAllClientsMessages();
  
      return sendSuccessResponse(200, messages);
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };
  
  export const handler = middy(getAllClientsMessagesHandler);