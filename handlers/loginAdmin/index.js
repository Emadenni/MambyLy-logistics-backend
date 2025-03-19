import middy from "@middy/core";
import { sendSuccessResponse, sendError } from "../../responses/index.js";
import { loginAdmin } from "../../services/adminServices.js";
import { validationAdmin } from "../../middlewares/validationAdmin.js";
import { loginSchema } from "../../utils/adminSchema.js";


export const loginAdminHandler = async (event) => {
    const { email, password } = event.body;  

    try {
      const admin = await loginAdmin({ email, password });
      return sendSuccessResponse(admin);
    } catch (error) {
      return sendError(400, error.message);
    }
  };


export const handler = middy(loginAdminHandler).use(validationAdmin(loginSchema));
