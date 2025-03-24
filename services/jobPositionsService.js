import * as db from "../utils/dbUtils.js";
import { v4 as uuidv4 } from "uuid";

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
  if (!positionIdId) { 
    throw new Error("Position ID is required");
  }

  const params = {
    TableName: process.env.JOB_POSITIONS_NAME,
    Key: {
      positionId,  
    },
  };

  try {
    const result = await db.getItem(params);
    if (!result.Item) {
      throw new Error("Position not found");
    }
    return result.Item;
  } catch (error) {
    throw new Error("Error retrieving message: " + error.message);
  }
};
