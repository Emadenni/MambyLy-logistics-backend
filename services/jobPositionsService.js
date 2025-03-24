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

}
