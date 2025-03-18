import { registerAdmin } from "../../services/adminServices";
import { successResponse, errorResponse } from "../responses/index";

export const registerAdminHandler = async (event) => {
  try {
    const adminData = JSON.parse(event.body);

    const admin = await registerAdmin(adminData);

    return successResponse({
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    console.error("Error registering admin: ", error.message);
    return errorResponse(error.message || "Internal server error", error.statusCode || 500);
  }
};
