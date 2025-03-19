import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getClientMessage } from "../../../services/clientsMessagesService.js";


const getClientMessageHandler = async (event) => {
    try {
      const { clientMessageId } = event.queryStringParameters;
  
      const message = await getClientMessage(clientMessageId);
  
      return sendSuccessResponse(200, message);
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };
  
  export const handler = middy(getClientMessageHandler);