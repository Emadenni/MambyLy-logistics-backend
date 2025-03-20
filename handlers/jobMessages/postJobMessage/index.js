import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../responses/index.js";
import { postJobMessage } from "../services/jobMessagesService.js";
import { validation } from "../middlewares/validation.js";
import { jobMessageSchema } from "../utils/jobMessageSchema.js";

const postJobMessageHandler = async (event) => {
  try {
    const messageData = event.body;
    const response = await postJobMessage(messageData);

    return sendSuccessResponse(201, {
      message: "Job message successfully sent",
      jobMessageId: response.jobMessageId,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(postJobMessageHandler).use(validation(jobMessageSchema));
