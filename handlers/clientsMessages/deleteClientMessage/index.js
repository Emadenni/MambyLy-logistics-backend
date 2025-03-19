import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { deleteClientMessage } from "../../../services/clientsMessagesService.js";


const deleteClientMessageHandler = async (event) => {
    try {
      const { clientMessageId } = event.queryStringParameters;
  
      const response = await deleteClientMessage(clientMessageId);
  
      return sendSuccessResponse(200, {
        message: "Message successfully deleted",
      });
    } catch (error) {
      return sendError(500, error.message || "Internal server error");
    }
  };
  
  export const handler = middy(deleteClientMessageHandler);