import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { getJobMessage } from "../../../services/jobMessagesService.js";

const getJobMessageHandler = async (event) => {
  try {
    const { jobMessageId } = event.queryStringParameters;

    if (!jobMessageId) {
      return sendError(400, "jobMessageId is required");
    }

    const message = await getJobMessage(jobMessageId);

    if (!message) {
      return sendError(404, "Job message not found");
    }

    return sendSuccessResponse(200, message);
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(getJobMessageHandler);
