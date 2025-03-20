import * as db from "../utils/dbUtils.js";
import { uploadProfileImg, deleteProfileImg } from "./ProfileImgService.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerAdmin = async (adminData) => {
  const { firstName, lastName, email, password, profileImage } = adminData;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("Missing required fields");
  }

  const checkEmailParams = {
    TableName: process.env.ADMIN_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const existingAdmins = await db.queryItems(checkEmailParams);
  if (existingAdmins.Items && existingAdmins.Items.length > 0) {
    throw new Error("Email Already in use");
  }

  const adminId = uuidv4();

  const hashedPassword = await bcrypt.hash(password, 10);

  let imageUrl = "";
  if (profileImage) {
    try {
      imageUrl = await uploadProfileImg(profileImage, adminId);
    } catch (error) {
      throw new Error("Error uploading profile image");
    }
  }

  const admin = {
    adminId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profileImageUrl: imageUrl,
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Item: admin,
  };

  try {
    await db.putItem(params);

    return { adminId, firstName, lastName, email, role: "admin" };
  } catch (error) {
    throw new Error("Error registering admin: " + error.message);
  }
};

//---------------------------------------------------------

export const loginAdmin = async (loginData) => {
  const { email, password } = loginData;

  const checkEmailParams = {
    TableName: process.env.ADMIN_TABLE_NAME,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  const existingAdmins = await db.queryItems(checkEmailParams);

  if (!existingAdmins.Items || existingAdmins.Items.length === 0) {
    throw new Error("Admin not found");
  }

  const admin = existingAdmins.Items[0];

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  console.log("Returning admin:", admin);

  const token = jwt.sign({ adminId: admin.adminId, role: admin.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

  return {
    adminId: admin.adminId,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role,
    token,
  };
};

//---------------------------------------------

export const getAdmin = async (adminId) => {
  const getAdminParams = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: {
      adminId: adminId,
    },
  };

  try {
    const adminData = await db.getItem(getAdminParams);
    if (!adminData.Item) {
      throw new Error("Admin not found");
    }

    return {
      adminId: adminData.Item.adminId,
      firstName: adminData.Item.firstName,
      lastName: adminData.Item.lastName,
      email: adminData.Item.email,
      role: adminData.Item.role,
      profileImageUrl: adminData.Item.profileImageUrl,
    };
  } catch (error) {
    throw new Error("Error retrieving admin: " + error.message);
  }
};

//----------------------------------------------------

export const updateAdmin = async (adminId, updateData) => {
  const { firstName, lastName, email, password, profileImage } = updateData;

  let updateValues = {};

  if (firstName) {
    updateValues.firstName = firstName;
  }
  if (lastName) {
    updateValues.lastName = lastName;
  }
  if (email) {
    updateValues.email = email;
  }
  if (password) {
    updateValues.password = await bcrypt.hash(password, 10);
  }
  if (profileImage) {
    updateValues.profileImageUrl = profileImage;
  }

  if (Object.keys(updateValues).length === 0) {
    throw new Error("No fields to update");
  }

  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: { adminId },
    UpdateExpression: `set ${Object.keys(updateValues)
      .map((key, index) => `#${key} = :${key}`)
      .join(", ")}`,
    ExpressionAttributeNames: Object.fromEntries(Object.keys(updateValues).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: Object.fromEntries(
      Object.keys(updateValues).map((key) => [`: ${key}`, updateValues[key]])
    ),
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await db.updateItem(params);
    if (!result.Attributes) {
      throw new Error("Admin update failed");
    }

    return {
      adminId: result.Attributes.adminId,
      firstName: result.Attributes.firstName,
      lastName: result.Attributes.lastName,
      email: result.Attributes.email,
      profileImageUrl: result.Attributes.profileImageUrl,
    };
  } catch (error) {
    throw new Error("Error updating admin: " + error.message);
  }
};

// -----------------------------------------

export const deleteAdmin = async (adminId) => {
  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: {
      adminId,
    },
  };

  try {
    const result = await db.getItem(params);
    const admin = result.Item;

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (admin.profileImageUrl) {
      const imageUrlParts = admin.profileImageUrl.split("/");
      const fileKey = imageUrlParts[imageUrlParts.length - 1];
      await deleteProfileImg(fileKey);
    }

    const deleteParams = {
      TableName: process.env.ADMIN_TABLE_NAME,
      Key: {
        adminId,
      },
    };
    await db.deleteItem(deleteParams);

    return { message: "Admin deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting admin: " + error.message);
  }
};

// -----------------------------------------

export const getAllAdmins = async () => {
  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
  };

  try {
    const result = await db.scanItems(params);
    return result.Items;
  } catch (error) {
    throw new Error("Error fetching admins: " + error.message);
  }
};
