import * as db from "../utils/dbUtils.js";
import { uploadProfileImg, deleteProfileImg } from "./ProfileImgService.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerSuperAdmin = async (adminData) => {
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

  const superAdmin = {
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
    Item: superAdmin,
  };

  try {
    await db.putItem(params);

    return { adminId, firstName, lastName, email, role: "superadmin" };
  } catch (error) {
    throw new Error("Error registering superadmin: " + error.message);
  }
};

//-------------------------------------------------------

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
  const { firstName, lastName, email } = updateData;

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

  if (Object.keys(updateValues).length === 0) {
    throw new Error("No fields to update");
  }

  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: {
      adminId: adminId,
    },
    UpdateExpression: `set ${Object.keys(updateValues)
      .map((key) => `#${key} = :${key}`)
      .join(", ")}`,
    ExpressionAttributeNames: Object.fromEntries(Object.keys(updateValues).map((key) => [`#${key}`, key])),
    ExpressionAttributeValues: Object.fromEntries(
      Object.keys(updateValues).map((key) => [`:${key}`, updateValues[key]])
    ),
    ReturnValues: "ALL_NEW", 
  };

  try {
    const result = await db.updateItem(params);

    if (!result.Attributes) {
      throw new Error("Admin update failed");
    }


    return result.Attributes;
  } catch (error) {
    throw new Error("Error updating admin: " + error.message);
  }
};


// -----------------------------------------

export const deleteAdmin = async (adminId) => {
  try {
    const admin = await getAdmin(adminId);

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (admin.role === "superadmin") {
      throw new Error("Cannot delete a superadmin");
    }

    if (admin.profileImageUrl) {
      const adminIdFromUrl = admin.profileImageUrl.split("/")[4];
      await deleteProfileImg(adminIdFromUrl);
    }

    console.log("Admin profile image URL:", admin.profileImageUrl);

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

    const adminsWithoutPassword = result.Items.map((admin) => {
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    });

    return adminsWithoutPassword;
  } catch (error) {
    throw new Error("Error fetching admins: " + error.message);
  }
};

//---------------------------------------------

export const updateAdminPassword = async (adminId, newPassword) => {
  if (!newPassword) {
    throw new Error("Password is required");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const params = {
    TableName: process.env.ADMIN_TABLE_NAME,
    Key: {
      adminId: adminId,
    },
    UpdateExpression: "set password = :password",
    ExpressionAttributeValues: {
      ":password": hashedPassword,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await db.updateItem(params);

    if (!result.Attributes) {
      throw new Error("Admin password update failed");
    }
  } catch (error) {
    throw new Error("Error updating admin password: " + error.message);
  }
};
