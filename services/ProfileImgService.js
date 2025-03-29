import AWS from "aws-sdk";
import * as db from "../utils/dbUtils.js";

const S3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

const getFileExtension = (mimetype) => {
  switch (mimetype) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
};

const updateProfileImageInDB = async (adminId, imageUrl) => {
  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: { adminId: adminId },
    UpdateExpression: "set profileImageUrl = :imageUrl",
    ExpressionAttributeValues: { ":imageUrl": imageUrl },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await db.updateItem(params);
    return result.Attributes;
  } catch (error) {
    throw new Error("Error updating profile image URL in database");
  }
};

export const uploadProfileImg = async (base64Image, adminId, mimetype) => {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const fileExtension = getFileExtension(mimetype);
  const fileName = `profile-images/${adminId}-${Date.now()}.${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
    ACL: "public-read",
  };

  try {
    const data = await S3.upload(params).promise();
    const imageUrl = data.Location;

    const adminData = await db.getItem({
      TableName: process.env.ADMIN_TABLE_NAME,
      Key: { adminId: adminId },
    });

    if (adminData.Item && adminData.Item.profileImageUrl === imageUrl) {
      return imageUrl;
    }

    await updateProfileImageInDB(adminId, imageUrl);
    return imageUrl;
  } catch (error) {
    throw new Error("Error uploading profile image: " + error.message);
  }
};

export const deleteProfileImg = async (adminId) => {
  const fileName = `profile-images/${adminId}`;
  const formats = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  let deleted = false;

  for (const format of formats) {
    let key = `${fileName}.${format}`;
    if (fileName.endsWith(`.${format}`)) {
      key = fileName;
    }

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await S3.deleteObject(params).promise();
      deleted = true;
      break;
    } catch (error) {
      continue;
    }
  }

  if (deleted) {
    return "Profile image deleted successfully";
  } else {
    throw new Error("Profile image not found to delete");
  }
};

export const getProfileImg = async (adminId) => {
  const formats = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  let imageUrl = "";

  for (const format of formats) {
    const params = {
      Bucket: bucketName,
      Key: `profile-images/${adminId}.${format}`,
    };

    try {
      await S3.headObject(params).promise();
      imageUrl = `https://${bucketName}.s3.amazonaws.com/profile-images/${adminId}.${format}`;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!imageUrl) {
    imageUrl = `https://${bucketName}.s3.amazonaws.com/default-profile.jpg`;
  }
  return imageUrl;
};
