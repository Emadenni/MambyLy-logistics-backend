import { db } from "../services/db";
import { uploadProfileImg } from "../services/profileImageService";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const handler = async (event) => {
  try {
    const { firstName, lastName, email, password, profileImage } = JSON.parse(event.body);

    if (!firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = "";
    if (profileImage) {
      try {
        imageUrl = await uploadProfileImg(profileImage, adminId);
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Error uploading profile image" }),
        };
      }
    }

    const adminData = {
      adminId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImageUrl: imageUrl,
      role: "superadmin",
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: process.env.ADMIN_TABLE_NAME,
      Item: adminData,
    };

    await db.put(params);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Super admin registered successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error registering super admin", error: error.message }),
    };
  }
};
