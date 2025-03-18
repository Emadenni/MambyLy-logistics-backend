import * as db from "../utils/dbUtils.js"
import { uploadProfileImg } from "./ProfileImgService"; // Funzione per il caricamento dell'immagine
import { v4 as uuidv4 } from "uuid"; // Per generare un ID unico
import bcrypt from "bcryptjs"; // Per il hashing delle password

export const registerAdmin = async (adminData) => {
  const { firstName, lastName, email, password, profileImage } = adminData;

  if (!firstName || !lastName || !email || !password) {
    throw new Error("Missing required fields");
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
    role: "superadmin",
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Item: admin,
  };

  try {
    await db.putItem(params);

    return { adminId, firstName, lastName, email, role: "superadmin" };
  } catch (error) {
    throw new Error("Error registering admin: " + error.message);
  }
};
