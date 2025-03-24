import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../../responses/index.js";
import { postJobPosition } from "../../../services/jobPositionsService.js";
import { validation } from "../../../middlewares/validation.js";
import { positionSchema } from "../../../utils/positionSchema.js";
import { auth } from "../../../middlewares/auth.js";

const postJobPositionHandler = async (event) => {
  try {
    const positionData = event.body;
    const response = await postJobPosition(positionData);

    return sendSuccessResponse(201, {
      message: "Psition successfully added",
      messageId: response.positionId,
    });
  } catch (error) {
    return sendError(500, error.message || "Internal server error");
  }
};

export const handler = middy(postJobPositionHandler).use(validation(positionSchema)).use(auth());
