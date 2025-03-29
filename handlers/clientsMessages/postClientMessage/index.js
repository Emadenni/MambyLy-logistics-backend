import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { postClientMessage } from "../../../services/clientsMessagesService.js";
import { validation } from "../../../middlewares/validation.js";
import { clientMessageSchema } from "../../../utils/clientMessageSchema.js";

const postClientMessageHandler = async (event) => {
  try {
    const messageData = event.body;
    const response = await postClientMessage(messageData);

    return sendSuccessResponse(201, {
      message: "Message successfully sent",
      messageId: response.clientMessageId,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(postClientMessageHandler).use(validation(clientMessageSchema));
