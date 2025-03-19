import * as db from "../utils/dbUtils.js";
import { uploadProfileImg } from "./ProfileImgService.js";
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
