import * as db from "../utils/dbUtils.js";
import { v4 as uuidv4 } from "uuid";


export const postClientMessage = async (messageData) => {
  const { name, email, subject, textMessage } = messageData;

  if (!name || !email || !subject || !textMessage) {
    throw new Error("Missing required fields");
  }

  const clientMessageId = uuidv4();
  const sentAt = new Date().toISOString();

  const message = {
    clientMessageId,  
    name,
    email,
    subject,
    textMessage,
    sentAt,
  };

  const params = {
    TableName: process.env.CLIENTS_MESSAGES_TABLE,
    Item: message,
  };

  try {
    await db.putItem(params);
    return {
      success: true,
      message: "Message successfully sent",
      clientMessageId, 
    };
  } catch (error) {
    throw new Error("Error sending message: " + error.message);
  }
};


export const deleteClientMessage = async (clientMessageId) => {
  if (!clientMessageId) { 
    throw new Error("Client Message ID is required to delete the message");
  }

  const params = {
    TableName: process.env.CLIENTS_MESSAGES_TABLE,
    Key: {
      clientMessageId,  
    },
  };

  try {
    await db.deleteItem(params);
    return {
      success: true,
      message: "Message successfully deleted",
    };
  } catch (error) {
    throw new Error("Error deleting message: " + error.message);
  }
};


export const getClientMessage = async (clientMessageId) => {
  if (!clientMessageId) { 
    throw new Error("Client Message ID is required");
  }

  const params = {
    TableName: process.env.CLIENTS_MESSAGES_TABLE,
    Key: {
      clientMessageId,  
    },
  };

  try {
    const result = await db.getItem(params);
    if (!result.Item) {
      throw new Error("Message not found");
    }
    return result.Item;
  } catch (error) {
    throw new Error("Error retrieving message: " + error.message);
  }
};


export const getAllClientsMessages = async () => {
  const params = {
    TableName: process.env.CLIENTS_MESSAGES_TABLE,
  };

  try {
    const result = await db.scanItems(params);
    return result.Items;
  } catch (error) {
    throw new Error("Error retrieving all messages: " + error.message);
  }
};
