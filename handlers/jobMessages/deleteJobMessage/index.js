import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { deleteJobMessage } from "../../../services/jobMessagesService.js";

const deleteJobMessageHandler = async (event) => {
  try {
    const { jobMessageId } = event.queryStringParameters;

    if (!jobMessageId) {
      return sendError(400, "jobMessageId is required");
    }

    await deleteJobMessage(jobMessageId);

    return sendSuccessResponse(200, {
      message: "Job message successfully deleted",
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(deleteJobMessageHandler);
