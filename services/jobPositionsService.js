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

export const updateJobPosition = async (positionId) => {
  if (!positionId) {
    throw new Error("Position ID is required");
  }

  try {
    // Log per verificare il positionId
    console.log("Recuperando posizione con ID:", positionId);

    const position = await getJobPosition(positionId);

    if (!position) {
      throw new Error("Position not found");
    }

    const updatedPosition = {
      ...position,
      modifiedAt: new Date().toISOString(),
    };

    const params = {
      TableName: process.env.JOB_POSITIONS_NAME,
      Key: {
        positionId: updatedPosition.positionId,
        createdAt: updatedPosition.createdAt,
      },
      UpdateExpression: "SET #modifiedAt = :modifiedAt",
      ExpressionAttributeNames: {
        "#modifiedAt": "modifiedAt",
      },
      ExpressionAttributeValues: {
        ":modifiedAt": updatedPosition.modifiedAt,
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("Eseguito update con i seguenti parametri:", params);

    const result = await db.updateItem(params);

    return result.Attributes;
  } catch (error) {
    // Log dell'errore
    console.error("Errore nell'aggiornamento della posizione:", error.message);
    throw new Error("Error updating position: " + error.message);
  }
};

//-------------------------------------------

export const deleteJobPosition = async (positionId) => {
  if (!positionId) {
    throw new Error("Position ID is required");
  }

  try {
    const position = await getJobPosition(positionId);

    if (!position) {
      throw new Error("Position not found");
    }

    const params = {
      TableName: process.env.JOB_POSITIONS_NAME,
      Key: {
        positionId: position.positionId,
        createdAt: position.createdAt,
      },
    };

    await db.deleteItem(params);

    return {
      success: true,
      message: "Position successfully deleted",
      positionId,
    };
  } catch (error) {
    throw new Error("Error deleting position: " + error.message);
  }
};
