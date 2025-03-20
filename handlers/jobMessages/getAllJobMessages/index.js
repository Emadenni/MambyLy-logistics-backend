import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getAllJobMessages } from "../../../services/jobMessagesService.js";

const getAllJobMessagesHandler = async () => {
  try {
    const messages = await getAllJobMessages();

    if (!messages || messages.length === 0) {
      return sendSuccessResponse(200, { message: "No messages found" });
    }

    return sendSuccessResponse(200, messages);
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(getAllJobMessagesHandler);
