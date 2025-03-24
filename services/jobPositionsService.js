import * as db from "../utils/dbUtils.js";

export const postJobPosition = async (positionData) => {
  const { positionId, departure, destination, distance, type } = positionData;

  if (!positionId || !departure || !destination || !distance || !type) {
    throw new Error("Missing required fields");
  }

  const createdAt = new Date().toISOString();

  const message = {
    positionId,
    departure,
    destination,
    distance,
    type,
    createdAt,
  };

  const params = {
    TableName: process.env.JOB_POSITIONS_NAME,
    Item: message,
  };

  try {
    await db.putItem(params);
    return {
      success: true,
      message: "Position successfully added",
      positionId,
    };
  } catch (error) {
    throw new Error("Error sending message: " + error.message);
  }
};

//--------------------------------

export const getJobPosition = async (positionId) => {
  if (!positionId) {
    throw new Error("Position ID is required");
  }

  const params = {
    TableName: process.env.JOB_POSITIONS_NAME,
    KeyConditionExpression: "positionId = :pid",
    ExpressionAttributeValues: {
      ":pid": positionId,
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  try {
    const result = await db.queryItems(params);
    if (!result.Items || result.Items.length === 0) {
      throw new Error("Position not found");
    }
    return result.Items[0];
  } catch (error) {
    throw new Error("Error retrieving position: " + error.message);
  }
};

//---------------------------------

export const getAllJobPositions = async () => {
  const params = {
    TableName: process.env.JOB_POSITIONS_NAME,
    Limit: 100,
  };

  try {
    const result = await db.scanItems(params);

    if (!result.Items || result.Items.length === 0) {
      throw new Error("No positions found");
    }

    return result.Items;
  } catch (error) {
    throw new Error("Error retrieving positions: " + error.message);
  }
};

//------------------------------------------

export const deleteJobPosition = async (positionId, createdAt) => {
  if (!positionId || !createdAt) {
    throw new Error("Position ID and createdAt are required");
  }

  const params = {
    TableName: process.env.JOB_POSITIONS_NAME,
    Key: {
      positionId,
      createdAt,
    },
  };

  try {
    await db.deleteItem(params);
    return { success: true, message: `Position with ID ${positionId} deleted successfully` };
  } catch (error) {
    console.error("Error deleting position:", error);
    throw new Error("Error deleting position: " + error.message);
  }
};