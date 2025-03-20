import * as db from "../utils/dbUtils.js";
import { v4 as uuidv4 } from "uuid";
import { uploadJobCv } from "./uploadService.js";

export const postJobMessage = async (messageData) => {
  const { name, email, subject, textMessage, uploadCvBase64, mimetype } = messageData;

  if (!name || !email || !subject || !textMessage) {
    throw new Error("Missing required fields");
  }

  const jobMessageId = uuidv4();
  const sentAt = new Date().toISOString();

  let uploadCvUrl = null;
  if (uploadCvBase64) {
    try {
      uploadCvUrl = await uploadJobCv(uploadCvBase64, jobMessageId, mimetype);
    } catch (error) {
      throw new Error("Error uploading CV: " + error.message);
    }
  }

  const message = {
    jobMessageId,
    name,
    email,
    subject,
    textMessage,
    sentAt,
    uploadCv: uploadCvUrl,
  };

  const params = {
    TableName: process.env.JOB_MESSAGES_NAME,
    Item: message,
  };

  try {
    await db.putItem(params);
    return {
      success: true,
      message: "Job message successfully sent",
      jobMessageId,
    };
  } catch (error) {
    throw new Error("Error sending job message: " + error.message);
  }
};

export const deleteJobMessage = async (jobMessageId) => {
  if (!jobMessageId) {
    throw new Error("Job Message ID is required to delete the message");
  }

  const params = {
    TableName: process.env.JOB_MESSAGES_NAME,
    Key: {
      jobMessageId,
    },
  };

  try {
    await db.deleteItem(params);
    return {
      success: true,
      message: "Job message successfully deleted",
    };
  } catch (error) {
    throw new Error("Error deleting job message: " + error.message);
  }
};

export const getJobMessage = async (jobMessageId) => {
  if (!jobMessageId) {
    throw new Error("Job Message ID is required");
  }

  const params = {
    TableName: process.env.JOB_MESSAGES_NAME,
    Key: {
      jobMessageId,
    },
  };

  try {
    const result = await db.getItem(params);
    if (!result.Item) {
      throw new Error("Message not found");
    }
    return result.Item;
  } catch (error) {
    throw new Error("Error retrieving job message: " + error.message);
  }
};

export const getAllJobMessages = async () => {
  const params = {
    TableName: process.env.JOB_MESSAGES_NAME,
  };

  try {
    const result = await db.scanItems(params);
    return result.Items;
  } catch (error) {
    throw new Error("Error retrieving all job messages: " + error.message);
  }
};
