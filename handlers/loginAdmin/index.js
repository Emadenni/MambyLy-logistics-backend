import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../responses/index.js";
import { loginAdmin } from "../../services/adminServices.js";
import { validationAdmin } from "../../middlewares/validationAdmin.js";
import { loginSchema } from "../../utils/adminSchema.js";

export const loginAdminHandler = async (event) => {
  console.log("Event body:", event.body);
  const { email, password } = event.body;

  try {
    const admin = await loginAdmin({ email, password });
    console.log("Admin found:", admin.token);
    return sendSuccessResponse(200, {
      adminId: admin.adminId,
      token: admin.token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return sendError(400, error.message);
  }
};

export const handler = middy(loginAdminHandler).use(validationAdmin(loginSchema));
